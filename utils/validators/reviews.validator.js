import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validator.miiddleware.js';
import { Review } from '../../models/review.model.js';
const craeteReviewValidator = [
  check('title').notEmpty().withMessage('Review title is required'),
  check('rating').notEmpty().withMessage('Review rating is required'),
  check('product')
    .notEmpty()
    .withMessage('Review product is required')
    .isMongoId()
    .withMessage('Invalid product ID format')
    .custom(async (productId, { req }) => {
      // check if review already exists for this product and user
      const review = await Review.findOne({
        product: productId,
        user: req.user._id,
      });
      if (review) {
        throw new Error('Review for this product already exists');
      }
      return true;
    }),

  check('user')
    .notEmpty()
    .withMessage('Review user is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  validatorMiddleware,
];
const deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid review ID format')
    .custom(async (reviewId, { req }) => {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }
      if (review.user.toString() !== req.user._id.toString()) {
        throw new Error('You are not allowed to delete this review');
      }
      return true;
    }),
  validatorMiddleware,
];
export { craeteReviewValidator, deleteReviewValidator };
