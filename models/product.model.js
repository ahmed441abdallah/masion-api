import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [20, 'Product description must be at least 20 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
    },
    imageCover: {
      type: String,
      required: [true, 'Product cover image is required'],
    },
    images: [String],
    colors: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    subcategory: {
      type: mongoose.Schema.ObjectId,
      ref: 'Subcategory',
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand',
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      default: 4,
    },
    ratingsQuantity: {
      type: Number,
      default: 1,
    },
    priceAfterDiscount: {
      type: Number,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});
// populate reviews when find one product
productSchema.pre('findOne', function () {
  this.populate({
    path: 'reviews',
    select: 'rating title user',
  });
});
const Product = mongoose.model('Product', productSchema);
export default Product;
