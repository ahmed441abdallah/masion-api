import express from 'express';

import {
  addSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  getSubcategoryById,
} from '../controllers/subcategory.controllers.js';
import {
  addSubcategoryValidator,
  deleteSubcategoryValidator,
} from '../utils/validators/subcatvalidator.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';

const subcategoryRouter = express.Router({ mergeParams: true });
subcategoryRouter.post(
  '/',
  protectRoute,
  allowedTo('admin'),
  addSubcategoryValidator,
  addSubcategory
);
subcategoryRouter.get('/', getAllSubcategories);
subcategoryRouter.delete(
  '/:id',
  protectRoute,
  allowedTo('admin'),
  deleteSubcategoryValidator,
  deleteSubcategory
);
subcategoryRouter.get('/:id', deleteSubcategoryValidator, getSubcategoryById);

export default subcategoryRouter;
