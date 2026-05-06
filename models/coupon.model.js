import mongoose from 'mongoose';
const couponSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, 'Coupon expire date is required'],
    },
    discount: {
      type: Number,
      required: [true, 'Coupon discount is required'],
    },
  },
  { timestamps: true }
);
export const Coupon = mongoose.model('Coupon', couponSchema);
