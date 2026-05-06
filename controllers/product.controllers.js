import asyncHandler from 'express-async-handler';
// eslint-disable-next-line import/extensions
import AppError from '../utils/AppError.js';
// eslint-disable-next-line import/extensions
import Product from '../models/product.model.js';
import ApiFeatures from '../utils/Apifeatures .js';
import * as factory from '../controllers/handlerFactory.js';
 

// @desc get all products
// @route GET /api/products
// @access Public

const getAllProducts = asyncHandler(async (req, res) => {
  // when nested under /categories/:categoryId/products, filter by category
  const filter = req.params.categoryId
    ? { category: req.params.categoryId }
    : {};
  const apiFeatures = new ApiFeatures(Product.find(filter), req.query);
  apiFeatures.filter().search().sort().selectFields().pagination();
  const products = await apiFeatures.query;
  const totalItems = await Product.countDocuments();
  res.status(200).json({
    results: products.length, // product in page
    status: 'success',
    data: { products },
    totalItems:totalItems

  });
});

// @desc get product by id
// @route GET /api/products/:id
// @access Public
const getProductById = factory.getOne(Product);
/*  const productId = req.params.id;
  const product = await Product.findById(productId, { __v: false });
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: product,
  });
  */

// @desc create a product
// @route POST /api/products
// @access Private
const createProduct = factory.createOne(Product);
// @desc update a product
// @route PUT /api/products/:id
// @access Private
const updateProduct = factory.updateOne(Product);
/* asyncHandler(async (req, res, next) => {
  const productId = req.params.id;
  const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedProduct) {
    return next(new AppError('Product not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: updatedProduct,
  });

});*/

// @desc delete a product
// @route DELETE /api/products/:id
// @access Private
const deleteProduct = factory.delteOne(Product);


export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
