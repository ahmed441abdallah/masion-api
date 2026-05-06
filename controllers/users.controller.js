import { User } from '../models/users.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

const getAllUsers = async (req, res) => {
  const users = await User.find({}, { __v: 0, password: 0 });
  return res.status(200).json({
    status: 'success',
    data: {
      users: users,
    },
  });
};
const registerUser = async (req, res) => {
  const { email } = req.body;
  const oldUser = await User.findOne({ email });
  if (oldUser) {
    return res.status(400).json({
      status: 'failed',
      message: 'User already exists',
    });
  }
  const newUser = new User({ ...req.body });
  await newUser.save();
  // Generate JWT token
  const token = jwt.sign(
    { email: newUser.email, id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET
  );
  newUser.token = token;
  await newUser.save();
  return res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    },
  });
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      status: 'failed',
      message: 'User not found',
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid credentials',
    });
  }
  const token = jwt.sign(
    { email: user.email, id: user._id, role: user.role },
    process.env.JWT_SECRET
  );
  return res.status(200).json({
    status: 'success',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};
const changeUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res
      .status(404)
      .json({ status: 'failed', message: 'User not found' });
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res
      .status(400)
      .json({ status: 'failed', message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  const token = jwt.sign(
    { email: user.email, id: user._id, role: user.role },
    process.env.JWT_SECRET
  );
  user.token = token;
  await user.save();
  return res.status(200).json({ status: 'success', data: { token } });
};

const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(404)
      .json({ status: 'failed', message: 'User not found' });
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');
  user.resetCode = hashedResetCode;
  user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
  user.resetCodeVerified = false;
  await user.save();
  await sendEmail({ name: user.name, email: user.email, resetCode });
  return res
    .status(200)
    .json({ status: 'success', message: 'Reset code sent to your email' });
};

const verifyResetCode = async (req, res) => {
  const hashedCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');
  const user = await User.findOne({
    resetCode: hashedCode,
    resetCodeExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res
      .status(400)
      .json({ status: 'failed', message: 'Invalid or expired reset code' });
  }
  user.resetCodeVerified = true;
  await user.save();
  return res
    .status(200)
    .json({ status: 'success', message: 'Reset code verified' });
};

const resetPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(404)
      .json({ status: 'failed', message: 'User not found' });
  }
  if (!user.resetCodeVerified) {
    return res
      .status(400)
      .json({ status: 'failed', message: 'Reset code not verified' });
  }
  user.password = req.body.newPassword;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  user.resetCodeVerified = false;
  const token = jwt.sign(
    { email: user.email, id: user._id, role: user.role },
    process.env.JWT_SECRET
  );
  user.token = token;
  await user.save();
  return res.status(200).json({ status: 'success', data: { token } });
};
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id, {
    __v: 0,
    password: 0,
    resetCode: 0,
    resetCodeExpires: 0,
    resetCodeVerified: 0,
  });
  return res.status(200).json({ status: 'success', data: { user } });
};

export {
  getAllUsers,
  registerUser,
  registerUser as registeUser,
  loginUser,
  changeUserPassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getUserProfile,
};
