import { check } from 'express-validator';
// eslint-disable-next-line import/extensions
import { validatorMiddleware } from '../../middlewares/validator.miiddleware.js';

const addCategoryValidator = [
  check('name').notEmpty().withMessage('Category name is required'),
  validatorMiddleware,
];
const deleteCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category ID format'),
  validatorMiddleware,
];

export { addCategoryValidator, deleteCategoryValidator };
