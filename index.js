import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { webhookCheckout } from './controllers/order.controller.js';
import { connectDB } from './config/database.js';
import AppError from './utils/AppError.js';
import { globalErrorHandler } from './middlewares/globalerrors.middleware.js';
import mountRoutes from './routes/index.js';

const app = express();
// Webhook route MUST be before express.json() — Stripe needs the raw body buffer
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);
app.use(express.json());
app.use(cors());
app.use(compression());
const port = process.env.PORT || 3000;
app.set('query parser', 'extended');
// Connect to MongoDB
connectDB();
mountRoutes(app);
// 404 error handling middleware
app.all('{*path}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//global error handling middleware
app.use(globalErrorHandler);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
