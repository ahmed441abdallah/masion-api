// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  // eslint-disable-next-line import/extensions
} from '../controllers/product.controllers.js';
import {
  createProductValidator,
  deleteProductValidator,
} from '../utils/validators/productValidator.js';
import {
  uploadMultiImages,
  uploadMultiImagesToCloudinary,
} from '../middlewares/uploadimages.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';
import reviewRouter from './review.routes.js';

const productRouter = express.Router({ mergeParams: true });
// get reviews for a product (:productId matches handlerFactory getAll filter)
productRouter.use('/:productId/reviews', reviewRouter);
productRouter.get('/', getAllProducts);
productRouter.post(
  '/',
  protectRoute,
  allowedTo('admin'),
  uploadMultiImages('imageCover', 'images'),
  uploadMultiImagesToCloudinary('imageCover', 'images', 'Products'),
  createProductValidator,
  createProduct
);
productRouter.get('/:id', getProductById);
productRouter.put('/:id', protectRoute, allowedTo('admin'), updateProduct);
productRouter.delete(
  '/:id',
  protectRoute,
  allowedTo('admin'),
  deleteProductValidator,
  deleteProduct
);
export default productRouter;
