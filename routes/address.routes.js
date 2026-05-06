import express from 'express';
import {
  addAddress,
  getAllAddresses,
  deleteAddress,
  updateAddress,
} from '../controllers/address.controller.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';
const addressRouter = express.Router();
addressRouter.use(protectRoute, allowedTo('user'));
addressRouter.post('/', addAddress);
addressRouter.get('/', getAllAddresses);
addressRouter.delete('/:id', deleteAddress);
addressRouter.put('/:id', updateAddress);
export default addressRouter;
