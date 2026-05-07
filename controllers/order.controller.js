import Cart from '../models/cart.model.js';
import asyncHandler from 'express-async-handler';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { User } from '../models/users.model.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/** Stripe redirects must hit your SPA origin, not the API host — set FRONTEND_URL in .env */
function clientAppOrigin() {
  const raw =
    process.env.FRONTEND_URL ??
    process.env.CLIENT_URL ??
    'http://localhost:5173';
  return raw.replace(/\/+$/, '');
}
// @desc create order
// @route POST /api/orders/:cartId
// @access private/user
const createCashOrder = asyncHandler(async (req, res) => {
  const { cartId } = req.params;
  const cart = await Cart.findById(cartId);
  if (!cart) {
    return res.status(404).json({
      status: 'error',
      message: 'Cart not found',
    });
  }
  const orderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const shippingPrice = orderPrice > 2000 ? 0 : 60;
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice: orderPrice + shippingPrice,
    shippingAddress: req.body.shippingAddress,
    shippingPrice: shippingPrice,
  });
  // update product quantity and sold
  const bulkOptions = cart.cartItems.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: +item.quantity },
        },
      },
    };
  });
  await Product.bulkWrite(bulkOptions, {});

  // clear cart
  await Cart.findByIdAndDelete(cartId);
  return res.status(200).json({
    status: 'success',
    data: { order },
  });
});
// @desc get order by id
// @route GET /api/orders/:id
// @access private
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Order not found' });
  }
  return res.status(200).json({ status: 'success', data: { order } });
});
// @desc get logged user orders
// @route GET /api/orders
// @access private/
const getLoggedUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  return res
    .status(200)
    .json({ status: 'success', data: { orders }, results: orders.length });
});
// @desc get all orders
// @route GET /api/orders
// @access private/admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find();
  return res
    .status(200)
    .json({ status: 'success', data: { orders }, results: orders.length });
});
// @desc update order status
// @route PUT /api/orders/:id
// @access private/admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByIdAndUpdate(
    id,
    { paidAt: Date.now(), ...req.body },
    { new: true }
  );
  if (!order) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Order not found' });
  }
  return res.status(200).json({ status: 'success', data: { order } });
});
// @desc create order with stripe
// @route POST /api/orders/create-checkout-session
// @access private/user
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { cartId } = req.params;
  const cart = await Cart.findById(cartId);
  if (!cart) {
    return res.status(404).json({ status: 'error', message: 'Cart not found' });
  }
  const orderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const shippingPrice = orderPrice > 2000 ? 0 : 60;
  const totalAmount = (orderPrice + shippingPrice) * 100;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: totalAmount,
          product_data: {
            name: req.user.name ? `Order — ${req.user.name}` : 'Order',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${clientAppOrigin()}/order-success`,
    cancel_url: `${clientAppOrigin()}/cart`,
    client_reference_id: cartId,
    customer_email: req.user.email,
    metadata: req.body.shippingAddress,
  });
  return res.status(200).json({ status: 'success', data: { session } });
});
const webhookCheckout = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata; // { address, city, phone }
    const userEmail = session.customer_email;
    const orderPrice = session.amount_total / 100;

    // 1. Find the cart
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }

    // 2. Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // 3. Create the order — marked as paid via card
    await Order.create({
      user: user._id,
      cartItems: cart.cartItems,
      totalOrderPrice: orderPrice,
      shippingAddress,
      shippingPrice: orderPrice > 2000 ? 0 : 60,
      paymentMethod: 'card',
      isPaid: true,
      paidAt: Date.now(),
      paymentStatus: 'paid',
    });

    // 4. Update product quantity and sold
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});

    // 5. Clear the cart
    await Cart.findByIdAndDelete(cartId);

    console.log(`✅ Card order created for ${userEmail}, cart: ${cartId}`);
  }

  res.status(200).json({ received: true });
});
export {
  createCashOrder,
  getOrderById,
  getLoggedUserOrders,
  getAllOrders,
  updateOrderStatus,
  createCheckoutSession,
  webhookCheckout,
};
