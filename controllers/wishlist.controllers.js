import { User } from '../models/users.model.js';
import Product from '../models/product.model.js';
import asyncHandler from 'express-async-handler';

// @desc add product to wishlist
// @route POST /api/v1/wishlist
// @access private
const addProductToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found',
    });
  }
  const user = await User.findById(req.user._id);
  user.wishlist.push(productId);
  await user.save();
  return res.status(200).json({
    status: 'success',
    message: 'Product added to wishlist',
    data: { wishlist: user.wishlist },
  });
});
// @desc remove product from wishlist
// @route DELETE /api/v1/wishlist/:productId
// @access private
const removeProductFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((el) => el.toString() !== productId);
  await user.save();
  return res.status(200).json({
    status: 'success',
    message: 'Product removed from wishlist',
    data: { wishlist: user.wishlist },
  });
});
// @desc get wishlist
// @route GET /api/v1/wishlist
// @access private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'title price imageCover',
  });

  return res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: { wishlist: user.wishlist },
  });
});
export { addProductToWishlist, removeProductFromWishlist, getWishlist };
