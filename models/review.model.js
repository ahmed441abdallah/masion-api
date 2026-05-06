import mongoose from 'mongoose';
import Product from './product.model.js';
const reviewSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      default: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  },
  { timestamps: true }
);
// before find reviews, populate user
reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name email',
  });
});
// calculate average rating and number of reviews
reviewSchema.statics.calcAvgRatingAndQuantity = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //update product Model
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      averageRating: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      averageRating: 4.5,
    });
  }
};
// when create new review , calculate average rating and quantity for the product
reviewSchema.post('save', function () {
  this.constructor.calcAvgRatingAndQuantity(this.product);
});

// when delete review , calculate average rating and quantity for the product
reviewSchema.post('remove', function () {
  this.constructor.calcAvgRatingAndQuantity(this.product);
});
export const Review = mongoose.model('Review', reviewSchema);
