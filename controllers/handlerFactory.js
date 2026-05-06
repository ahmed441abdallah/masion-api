import asyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
const getAll = (Model) => {
  return asyncHandler(async (req, res, next) => {
    // for nested routes, filter by product id
    let filter = {};
    if (req.params.productId) {
      filter = { product: req.params.productId };
    }
    const docs = await Model.find(filter, { __v: false });
    return res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs },
    });
  });
};
const delteOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    // find the document by id and delete it (product)
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    return res.status(200).json({
      status: 'success',
      message: 'Deleted successfully',
      data: null,
    });
    doc.remove();
  });
};
const getOne = (Model, populateOptions) => {
  return asyncHandler(async (req, res, next) => {
    // build query
    let query = Model.findById(req.params.id, { __v: false });
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    // execute query
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    return res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};
const updateOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDoc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: updatedDoc,
    });
  });
};
const createOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const newDoc = new Model(req.body);
    await newDoc.save();
    res.status(201).json({
      status: 'success',
      data: { newDoc },
    });
  });
};
export { delteOne, getOne, updateOne, createOne, getAll };
