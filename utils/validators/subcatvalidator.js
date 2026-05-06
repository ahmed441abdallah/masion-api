import { check } from 'express-validator';
import Category from '../../models/category.model.js';
import { validatorMiddleware } from '../../middlewares/validator.miiddleware.js';

const addSubcategoryValidator = [
  check('name').notEmpty().withMessage('Subcategory name is required'),
  check('category')
    .notEmpty()
    .isMongoId()
    .withMessage('Invalid category ID format')
    .custom((id) => {
      const category = Category.findById(id);
      if (!category) {
        return Promise.reject(new Error('Category not found'));
      }
    }),
  validatorMiddleware,
];
const deleteSubcategoryValidator = [
  check('id').isMongoId().withMessage('Invalid subcategory ID format'),
  validatorMiddleware,
];
export { addSubcategoryValidator, deleteSubcategoryValidator };
