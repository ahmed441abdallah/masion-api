import multer from 'multer';
import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// 1. إعداد Multer (حفظ في الذاكرة)

export const uploadSingleImage = (fieldName) => {
  const storage = multer.memoryStorage();
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an image'), false);
    }
  };
  const upload = multer({ storage, fileFilter });
  return upload.single(fieldName);
};
export const uploadMultiImages = (singleField, multipleFields) => {
  const storage = multer.memoryStorage();
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an image'), false);
    }
  };
  const upload = multer({ storage, fileFilter });
  return upload.fields([
    { name: singleField, maxCount: 1 },
    { name: multipleFields, maxCount: 10 },
  ]);
};

// helper: upload a single buffer to Cloudinary and return the secure_url
const streamUpload = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    stream.end(buffer);
  });

// upload one image  →  sets req.body[fieldName]
export const uploadImageToCloudinary = (fieldName, folderName) =>
  asyncHandler(async (req, res, next) => {
    if (!req.file) return next();
    req.body[fieldName] = await streamUpload(req.file.buffer, folderName);
    next();
  });

// upload cover + multiple images  →  sets req.body[singleField] and req.body[multipleFields]
export const uploadMultiImagesToCloudinary = (singleField, multipleFields, folderName) =>
  asyncHandler(async (req, res, next) => {
    if (!req.files) return next();

    // upload cover image
    if (req.files[singleField]) {
      req.body[singleField] = await streamUpload(
        req.files[singleField][0].buffer,
        folderName
      );
    }

    // upload array of images in parallel
    if (req.files[multipleFields]) {
      req.body[multipleFields] = await Promise.all(
        req.files[multipleFields].map((file) =>
          streamUpload(file.buffer, folderName)
        )
      );
    }

    next();
  });
