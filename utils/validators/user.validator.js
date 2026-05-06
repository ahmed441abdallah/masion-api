import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validator.miiddleware.js';
import { User } from '../../models/users.model.js';

const createUserValidator = [
  check('name').notEmpty().withMessage('Name is required'),
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  check('email').custom(async (val) => {
    const user = await User.findOne({ email: val });
    if (user) {
      throw new Error('Email already in use');
    }
    return true;
  }),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validatorMiddleware,
];
const changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid user ID format'),
  check('password').notEmpty().withMessage('Current password is required'),
  check('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  check('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .isLength({ min: 6 })
    .withMessage('Confirm password must be at least 6 characters'),
  validatorMiddleware,
];
const loginUserValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validatorMiddleware,
];
const forgotPasswordValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (!user) {
        throw new Error('User not found for this email');
      }
      return true;
    }),
  validatorMiddleware,
];
export {
  createUserValidator,
  changeUserPasswordValidator,
  loginUserValidator,
  forgotPasswordValidator,
};
