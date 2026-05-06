import express from 'express';
import {
  addProductToCart,
  applyCouponToCart,
  clearCart,
  deleteProductFromCart,
  getUserCart,
  updateProductQuantityInCart,
} from '../controllers/cart.controller.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';
const cartRouter = express.Router();
cartRouter.use(protectRoute, allowedTo('user'));
// Static paths must come before /:productId or "apply-coupon" is captured as an id
cartRouter.get('/', getUserCart);
cartRouter.delete('/', clearCart);
cartRouter.put('/apply-coupon', applyCouponToCart);
cartRouter.post('/:productId', addProductToCart);
cartRouter.delete('/:productId', deleteProductFromCart);
cartRouter.put('/:productId', updateProductQuantityInCart);
export default cartRouter;
