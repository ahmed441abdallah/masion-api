import asyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import { Subcategory } from '../models/subcategory.model.js';
import slugify from 'slugify';
import * as factory from '../controllers/handlerFactory.js';
const addSubcategory = factory.createOne(Subcategory);

const deleteSubcategory = factory.delteOne(Subcategory);

const getAllSubcategories = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.params.categoryId) {
    filter = { category: req.params.categoryId };
  }
  const subcategories = await Subcategory.find(filter, { __v: false });
  res.status(200).json({
    status: 'success',
    data: { subcategories },
  });
});
const getSubcategoryById = factory.getOne(Subcategory);

export {
  addSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  getSubcategoryById,
};
