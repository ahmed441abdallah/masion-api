import Category from '../models/category.model.js';
import asyncHandler from 'express-async-handler';
import * as factory from '../controllers/handlerFactory.js';

const getAllCategories = asyncHandler(async (req, res) => {
  // Pagination
  const query = req.query;
  // { page: 1, limit: 10 }  query.page, query.limit
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const categories = await Category.find({}, { __v: false })
    .skip(skip)
    .limit(limit);
  res.status(200).json({
    status: 'success',
    data: { categories },
  });
});

const addCategory = factory.createOne(Category);

const getCategoryById = factory.getOne(Category);
const deleteCategory = factory.delteOne(Category);

export { getAllCategories, addCategory, getCategoryById, deleteCategory };
