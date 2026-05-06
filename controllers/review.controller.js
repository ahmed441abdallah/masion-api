import * as factory from '../controllers/handlerFactory.js';
import { Review } from '../models/review.model.js';

// @desc get all reviews
// @route GET /api/v1/reviews
// @access public
const getAllReviews = factory.getAll(Review);

// @desc create review
// @route POST /api/v1/reviews
// @access private
const createReview = factory.createOne(Review);

// @desc get review by id
// @route GET /api/v1/reviews/:id
// @access public
const getReviewById = factory.getOne(Review);
const deleteReview = factory.delteOne(Review);
export { getAllReviews, createReview, getReviewById, deleteReview };
