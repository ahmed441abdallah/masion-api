import express from 'express';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReviewById,
} from '../controllers/review.controller.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';
import { craeteReviewValidator } from '../utils/validators/reviews.validator.js';
const reviewRouter = express.Router({ mergeParams: true });

const setProductIdAndUserIdToBody = (req, res, next) => {
  const productIdFromRoute = req.params.productId ?? req.params.id;
  if (!req.body.product && productIdFromRoute) req.body.product = productIdFromRoute;
  req.body.user = req.user._id;
  next();
};

reviewRouter.get('/', getAllReviews);
reviewRouter.post(
  '/',
  protectRoute,
  allowedTo('user'),
  setProductIdAndUserIdToBody,
  craeteReviewValidator,
  createReview
);
reviewRouter.get('/:id', getReviewById);
reviewRouter.delete('/:id', protectRoute, allowedTo('user'), deleteReview);
export default reviewRouter;
