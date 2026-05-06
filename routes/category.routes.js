// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-import
import express from 'express';
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  // eslint-disable-next-line import/extensions
} from '../controllers/category.controllers.js';
import {
  addCategoryValidator,
  deleteCategoryValidator,
  // eslint-disable-next-line import/extensions
} from '../utils/validators/catvalidator.js';
// eslint-disable-next-line import/extensions
import subcategoryRouter from './subcategory.routes.js';
import productRouter from './product.route.js';
import {
  uploadImageToCloudinary,
  uploadSingleImage,
} from '../middlewares/uploadimages.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';

const categoryRouter = express.Router({ mergeParams: true });
categoryRouter
  .get('/', getAllCategories)
  .post(
    '/',
    protectRoute,
    allowedTo('admin'),
    uploadSingleImage('image'),
    uploadImageToCloudinary('image', 'Categories'),
    addCategoryValidator,
    addCategory
  )
  .get('/:id', deleteCategoryValidator, getCategoryById)
  .delete(
    '/:id',
    protectRoute,
    allowedTo('admin'),
    deleteCategoryValidator,
    deleteCategory
  );
categoryRouter.use('/:categoryId/products', productRouter);

categoryRouter.use('/:categoryId/subcategories', subcategoryRouter);
export default categoryRouter;
