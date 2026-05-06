import Brand from '../models/brand.model.js';
import asyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import slugify from 'slugify';
import * as factory from '../controllers/handlerFactory.js';
// @desc  get all brands
// @route GET /api/brands
// @access Public
const getAllbrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({}, { __v: false });
  res.status(200).json({
    status: 'success',
    data: { brands },
  });
});
// @desc  create a brand
// @route POST /api/brands
// @access Private

const createBrand = factory.createOne(Brand);
// @desc  get a brand by id
// @route GET /api/brands/:id
// @access Public
const getBrandById = factory.getOne(Brand);

// @desc update a brand by id
// @route PUT /api/brands/:id
// @access Private

const updateBrand = factory.updateOne(Brand);
// @desc delete a brand by id
// @route DELETE /api/brands/:id
// @access Private
const deleteBrand = factory.delteOne(Brand);

export { getAllbrands, createBrand, getBrandById, updateBrand, deleteBrand };
