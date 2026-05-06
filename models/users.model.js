import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  email: {
    required: [true, 'Email is required'],
    type: String,
    unique: true,
  },
  password: {
    required: [true, 'Password is required'],
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  resetCode: {
    type: String,
  },
  resetCodeExpires: {
    type: Date,
  },
  resetCodeVerified: {
    type: Boolean,
    default: false,
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  address: [
    {
      alias: String,
      details: String,
      city: String,
      postalCode: String,
    },
  ],
});

// pre save middleware to hash password
// satatic method to hash password
// when user pre before saving hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
export const User = mongoose.model('User', userSchema);
