import { Coupon } from '../models/coupon.model.js';
import asyncHandler from 'express-async-handler';

/** DD/MM/YYYY is stored as midnight UTC on that calendar day (matches JSON, no server TZ shift). */
function parseExpireDate(value) {
  if (value == null) return value;
  if (value instanceof Date) return value;
  const s = String(value).trim();
  const ddMmYyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddMmYyyy) {
    const day = parseInt(ddMmYyyy[1], 10);
    const month = parseInt(ddMmYyyy[2], 10) - 1;
    const year = parseInt(ddMmYyyy[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    return Number.isNaN(d.getTime()) ? value : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? value : d;
}

// @desc create coupon
// @route POST /api/coupons
// @access Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    expire: parseExpireDate(req.body.expire),
  };
  const coupon = await Coupon.create(payload);
  return res.status(201).json({
    status: 'success',
    data: { coupon },
  });
});
// @desc delete coupon
// @route DELETE /api/coupons/:id
// @access Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  return res.status(200).json({
    status: 'success',
    data: { coupon },
  });
});
// @desc get all coupons
// @route GET /api/coupons
// @access Public
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  return res.status(200).json({
    status: 'success',
    data: { coupons },
  });
});
export { createCoupon, deleteCoupon, getAllCoupons };
