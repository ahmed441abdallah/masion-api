import express from 'express';
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from '../controllers/coupon.controller.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';
const couponRouter = express.Router();
couponRouter.use(protectRoute, allowedTo('admin'));
couponRouter.post('/', createCoupon);
couponRouter.delete('/:id', deleteCoupon);
couponRouter.get('/', getAllCoupons);
export default couponRouter;
