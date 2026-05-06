import mongoose from 'mongoose';
const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);
const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
