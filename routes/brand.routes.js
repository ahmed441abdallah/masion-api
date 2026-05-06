// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-import
import express from 'express';
import {
  createBrand,
  deleteBrand,
  getAllbrands,
  getBrandById,
  updateBrand,
} from '../controllers/brand.controllers.js';
import {
  uploadImageToCloudinary,
  uploadSingleImage,
} from '../middlewares/uploadimages.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';

const brandRouter = express.Router();
brandRouter.get('/', getAllbrands);
brandRouter.post(
  '/',
  protectRoute,
  allowedTo('admin'),
  uploadSingleImage('image'),
  uploadImageToCloudinary('image', 'Brands'),
  createBrand
);
brandRouter.get('/:id', getBrandById);
brandRouter.put('/:id', protectRoute, allowedTo('admin'), updateBrand);
brandRouter.delete('/:id', protectRoute, allowedTo('admin'), deleteBrand);

export default brandRouter;
