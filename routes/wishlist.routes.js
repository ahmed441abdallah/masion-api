import express from 'express';
import {
  addProductToWishlist,
  getWishlist,
  removeProductFromWishlist,
} from '../controllers/wishlist.controllers.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';
const wishlistRouter = express.Router();
wishlistRouter.use(protectRoute, allowedTo('user'));
wishlistRouter.post('/', addProductToWishlist);
wishlistRouter.delete('/:productId', removeProductFromWishlist);
wishlistRouter.get('/', getWishlist);
export default wishlistRouter;
