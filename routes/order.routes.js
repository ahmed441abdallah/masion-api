import express from 'express';
import {
  createCashOrder,
  createCheckoutSession,
  getAllOrders,
  getLoggedUserOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import protectRoute, { allowedTo } from '../middlewares/auth.middleware.js';
const orderRouter = express.Router();
orderRouter.use(protectRoute);
// admins get all orders; users get own orders — same path, branch on role
orderRouter.get('/', allowedTo('user', 'admin'), (req, res, next) => {
  const role = String(req.user.role ?? '').trim().toLowerCase();
  if (role === 'admin') {
    return getAllOrders(req, res, next);
  }
  return getLoggedUserOrders(req, res, next);
});

orderRouter.get(
  '/create-checkout-session/:cartId',
  allowedTo('user'),
  createCheckoutSession
);
orderRouter.post('/:cartId', allowedTo('user'), createCashOrder);
orderRouter.get('/:id', allowedTo('user', 'admin'), getOrderById);
orderRouter.put('/:id', allowedTo('admin'), updateOrderStatus);
export default orderRouter;
