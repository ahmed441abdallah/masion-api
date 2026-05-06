import express from 'express';
import {
  getAllUsers,
  registeUser,
  changeUserPassword,
  loginUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getUserProfile,
} from '../controllers/users.controller.js';
import {
  changeUserPasswordValidator,
  createUserValidator,
  forgotPasswordValidator,
  loginUserValidator,
} from '../utils/validators/user.validator.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';
const usersRouter = express.Router();
usersRouter.get('/', protectRoute, allowedTo('admin'), getAllUsers);
usersRouter.put(
  '/change-password/:id',
  protectRoute,
  changeUserPasswordValidator,
  changeUserPassword
);
usersRouter.post('/register', createUserValidator, registeUser);
usersRouter.post('/login', loginUserValidator, loginUser);
usersRouter.get('/profile', protectRoute, getUserProfile);
usersRouter.post('/forgot-password', forgotPasswordValidator, forgotPassword);
usersRouter.post('/verify-reset-code', verifyResetCode);
usersRouter.put('/reset-password', resetPassword);
export default usersRouter;
