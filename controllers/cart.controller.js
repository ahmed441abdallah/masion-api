import Cart from '../models/cart.model.js';
import { User } from '../models/users.model.js';
import asyncHandler from 'express-async-handler';
import Product from '../models/product.model.js';
import { Coupon } from '../models/coupon.model.js';

const populateCartProducts = [
  {
    path: 'cartItems.product',
    select: 'imageCover title brand',
    populate: { path: 'brand', select: 'name' },
  },
];

const calculateTotalCartPrice = (cart) => {
  return cart.cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};
// @desc add product to cart
// @route POST /api/cart
// @access private
const addProductToCart = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  const user = await User.findById(req.user._id);
  // check if user has a cart
  const cart = await Cart.findOne({ user: user._id });
  if (!cart) {
    // create a new cart
    const newCart = await Cart.create({
      user: user._id,
      cartItems: [
        {
          product: product._id,
          quantity: 1,
          price: product.priceAfterDiscount,
          color: req.body.color,
        },
      ],
      totalCartPrice: product.priceAfterDiscount,
      totalPriceAfterDiscount: product.priceAfterDiscount,
    });
    await newCart.populate(populateCartProducts);
    return res.status(200).json({
      status: 'success',
      data: { cart: newCart },
    });
  } else {
    // check if product already in cart
    const productInCart = cart.cartItems.find(
      (item) => item.product.toString() === product._id.toString()
    );
    if (productInCart) {
      // update the quantity
      productInCart.quantity++;
    } else {
      // add the product to the cart
      cart.cartItems.push({
        product: product._id,
        quantity: 1,
        price: product.priceAfterDiscount,
        color: req.body.color,
      });
    }
    // calculate total cart price
    cart.totalCartPrice = calculateTotalCartPrice(cart);
    await cart.save();
    await cart.populate(populateCartProducts);
    return res.status(200).json({
      status: 'success',
      data: { cart },
    });
  }
});
// @desc get user cart
// @route GET /api/cart
// @access private
const getUserCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    populateCartProducts
  );
  if (!cart) {
    return res.status(404).json({
      status: 'error',
      message: 'Cart not found',
    });
  }
  return res.status(200).json({
    status: 'success',
    data: { cart },
    length: cart.cartItems.length,
  });
});
// @desc Delete product from cart
// @route DELETE /api/cart/:productId
// @access private
const deleteProductFromCart = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  const cart = await Cart.findOne({ user: req.user._id });

  // check if product exists in cart
  const productInCart = cart.cartItems.find(
    (item) => item.product.toString() === product._id.toString()
  );
  if (!productInCart) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found in cart',
    });
  }
  // get user cart
  cart.cartItems = cart.cartItems.filter(
    (item) => item.product.toString() !== product._id.toString()
  );
  cart.totalCartPrice = calculateTotalCartPrice(cart);
  await cart.save();
  await cart.populate(populateCartProducts);
  return res.status(200).json({
    status: 'success',
    data: { cart },
  });
});
//@desc update product quantity in cart
//@route PUT /api/cart/:productId
//@access private
const updateProductQuantityInCart = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      status: 'error',
      message: 'Cart not found',
    });
  }
  const productInCart = cart.cartItems.find(
    (item) => item.product.toString() === product._id.toString()
  );
  if (!productInCart) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found in cart',
    });
  }
  if (req.body.quantity > product.quantity) {
    return res.status(400).json({
      status: 'error',
      message: `Quantity is not available, only ${product.quantity} left`,
    });
  }
  // update the quantity
  productInCart.quantity = req.body.quantity;
  cart.totalCartPrice = calculateTotalCartPrice(cart);
  await cart.save();
  await cart.populate(populateCartProducts);
  return res.status(200).json({
    status: 'success',
    data: { cart },
  });
});
//@desc clear cart
//@route DELETE /api/cart
//@access private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  return res.status(200).json({
    status: 'success',
    message: 'Cart cleared successfully',
  });
});
//@desc apply coupon to cart
//@route POST /api/cart/apply-coupon
//@access private
const applyCouponToCart = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return res.status(404).json({
      status: 'error',
      message: 'Coupon not found',
    });
  }
  const cart = await Cart.findOne({ user: req.user._id });
  const totalprice = cart.totalCartPrice;
  const discount = (totalprice * coupon.discount) / 100;
  cart.totalPriceAfterDiscount = (totalprice - discount).toFixed(2);
  await cart.save();
  await cart.populate(populateCartProducts);
  return res.status(200).json({
    status: 'success',
    message: 'Coupon applied successfully',
    discount: discount,
    data: { cart },
  });
});
export {
  addProductToCart,
  getUserCart,
  deleteProductFromCart,
  clearCart,
  updateProductQuantityInCart,
  applyCouponToCart,
};
