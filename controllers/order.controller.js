import Cart from '../models/cart.model.js';
import asyncHandler from 'express-async-handler';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { User } from '../models/users.model.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/** Stripe success/cancel URLs use FRONTEND_URL (or CLIENT_URL); default localhost:5173 when unset — fine for Stripe test + local SPA. */
function clientAppOrigin() {
  const raw = (process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? '').trim();
  if (!raw) {
    if (process.env.VERCEL === '1') {
      console.warn(
        '[FRONTEND_URL] missing — Stripe will redirect to http://localhost:5173 (set FRONTEND_URL on Vercel when you deploy the frontend).'
      );
    }
    return 'http://localhost:5173';
  }
  return raw.replace(/\/+$/, '');
}

/** Stripe metadata keys/values must be strings (max 500 chars each). */
function checkoutMetadata(req, shippingPrice) {
  const shipping =
    typeof req.body?.shippingAddress === 'object' &&
    req.body.shippingAddress !== null
      ? req.body.shippingAddress
      : {};
  const meta = {
    shipping_price: String(shippingPrice),
  };
  try {
    meta.shipping_json = JSON.stringify(shipping);
  } catch {
    meta.shipping_json = '{}';
  }
  return meta;
}

function shippingFromSessionMetadata(metadata) {
  if (!metadata?.shipping_json) {
    return { address: '', city: '', phone: '' };
  }
  try {
    const o = JSON.parse(metadata.shipping_json);
    return {
      address: o.address != null ? String(o.address) : '',
      city: o.city != null ? String(o.city) : '',
      phone: o.phone != null ? String(o.phone) : '',
    };
  } catch {
    return { address: '', city: '', phone: '' };
  }
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
  const frontend = clientAppOrigin();
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
    success_url: `${frontend}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontend}/cart`,
    client_reference_id: String(cartId),
    customer_email: req.user.email,
    metadata: checkoutMetadata(req, shippingPrice),
  });
  return res.status(200).json({ status: 'success', data: { session } });
});
const webhookCheckout = async (req, res) => {
  console.log('🔔 Webhook hit! Method:', req.method);
  console.log('🔔 Headers stripe-signature:', req.headers['stripe-signature'] ? 'present' : 'MISSING');
  console.log('🔔 Body type:', typeof req.body, '| isBuffer:', Buffer.isBuffer(req.body), '| length:', req.body?.length);
  console.log('🔔 STRIPE_WEBHOOK_SECRET set:', !!process.env.STRIPE_WEBHOOK_SECRET);

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    console.error('❌ No stripe-signature header found');
    return res.status(400).send('Webhook Error: Missing stripe-signature header');
  }

  let event;
  try {
    // Determine the raw payload — handle Vercel edge cases
    let payload = req.body;

    // If Vercel delivered the body as a string, convert to Buffer
    if (typeof payload === 'string') {
      console.log('🔔 Body is string, converting to Buffer');
      payload = Buffer.from(payload, 'utf-8');
    }

    // If body was pre-parsed as JSON object (Vercel may do this)
    if (typeof payload === 'object' && payload !== null && !Buffer.isBuffer(payload)) {
      console.error('❌ Body was parsed as JSON object — cannot verify signature');
      return res.status(400).send('Webhook Error: raw body required for Stripe signature verification');
    }

    if (!payload || payload.length === 0) {
      console.error('❌ Empty body received');
      return res.status(400).send('Webhook Error: empty body');
    }

    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Signature verified! Event type:', event.type);
  } catch (err) {
    console.error('❌ Stripe webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object;
      const cartId = session.client_reference_id;
      const userEmail = session.customer_email;
      const amountTotal = session.amount_total;
      const orderPrice = amountTotal != null ? amountTotal / 100 : 0;
      const shippingAddress = shippingFromSessionMetadata(session.metadata);
      const shippingPrice = Number(session.metadata?.shipping_price ?? 60);

      console.log('🔔 Processing checkout.session.completed:', { cartId, userEmail, orderPrice });

      if (!cartId || !userEmail) {
        console.error('❌ Missing cartId or customer_email', { cartId, userEmail });
      } else {
        const cart = await Cart.findById(cartId);
        if (!cart) {
          console.error('❌ Cart not found:', cartId);
        } else {
          const user = await User.findOne({ email: userEmail });
          if (!user) {
            console.error('❌ User not found:', userEmail);
          } else {
            const order = await Order.create({
              user: user._id,
              cartItems: cart.cartItems,
              totalOrderPrice: orderPrice,
              shippingAddress,
              shippingPrice,
              paymentMethod: 'card',
              isPaid: true,
              paidAt: Date.now(),
              paymentStatus: 'paid',
            });

            const bulkOptions = cart.cartItems.map((item) => ({
              updateOne: {
                filter: { _id: item.product },
                update: {
                  $inc: { quantity: -item.quantity, sold: +item.quantity },
                },
              },
            }));
            await Product.bulkWrite(bulkOptions, {});
            await Cart.findByIdAndDelete(cartId);

            console.log(`✅ Order created! ID: ${order._id}, user: ${userEmail}, cart: ${cartId}`);
          }
        }
      }
    } catch (e) {
      console.error('❌ Webhook handler error:', e);
    }
  }

  return res.status(200).json({ received: true });
};
export {
  createCashOrder,
  getOrderById,
  getLoggedUserOrders,
  getAllOrders,
  updateOrderStatus,
  createCheckoutSession,
  webhookCheckout,
};
