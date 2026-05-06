import { User } from '../models/users.model.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
const protectRoute = asyncHandler(async (req, res, next) => {
  // check if token is provided
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'failed',
      message: 'No token provided',
    });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized access',
    });
  }
  // verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId =
    decoded.id ??
    decoded.userId ??
    decoded.user_id ??
    decoded._id;
  if (!userId) {
    return res.status(401).json({
      status: 'failed',
      message: 'Invalid token payload',
    });
  }
  // check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({
      status: 'failed',
      message: ' User not found',
    });
  }
  // attach user — normalize role so checks match schema enum (user/admin)
  const rawRole =
    user.role ??
    decoded.role ??
    'user';
  user.role =
    typeof rawRole === 'string'
      ? rawRole.trim().toLowerCase()
      : 'user';
  req.user = user;
  next();
});

/** Role names matched case-insensitively; missing role treats as user */
export const allowedTo = (...roles) => {
  const allowed = roles.map((r) =>
    String(r).trim().toLowerCase()
  );
  return asyncHandler(async (req, res, next) => {
    const role = String(req.user.role ?? 'user')
      .trim()
      .toLowerCase();
    if (!allowed.includes(role)) {
      return res.status(403).json({
        status: 'failed',
        message: 'You are not authorized to access this resource',
      });
    }
    next();
  });
};

export default protectRoute;
