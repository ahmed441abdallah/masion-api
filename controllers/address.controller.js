import asyncHandler from 'express-async-handler';
import { User } from '../models/users.model.js';
// @desc add address
// @route POST /api/v1/address
// @access private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.address.push(req.body);
  await user.save();
  return res.status(200).json({
    status: 'success',
    results: user.address.length,
    data: { address: user.address },
  });
});
// @desc get all addresses
// @route GET /api/v1/address
// @access private
const getAllAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.status(200).json({
    status: 'success',
    results: user.address.length,
    data: { address: user.address },
  });
});
// @desc delete address
// @route DELETE /api/v1/address/:id
// @access private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.address = user.address.filter(
    (el) => el._id.toString() !== req.params.id
  );
  await user.save();
  return res.status(200).json({
    status: 'success',
    results: user.address.length,
    data: { address: user.address },
  });
});
// @desc update address
// @route PUT /api/v1/address/:id
// @access private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.address = user.address.map((el) =>
    el.id === req.params.id ? { ...el, ...req.body } : el
  );
  await user.save();
  return res.status(200).json({
    status: 'success',
    results: user.address.length,
    data: { address: user.address },
  });
});
export { addAddress, getAllAddresses, deleteAddress, updateAddress };
