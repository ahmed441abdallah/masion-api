import mongoose from 'mongoose';
const subcategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      unique: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category', // Reference to the Category model
      required: [true, 'Subcategory must belong to a category'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },

  { timestamps: true }
);
export const Subcategory = mongoose.model('Subcategory', subcategorySchema);
