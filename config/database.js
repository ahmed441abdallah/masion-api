import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const mongoUrl = (process.env.MONGO_URL || '').trim().replace(/;$/, '');

export const connectDB = () => {
  mongoose
    .connect(mongoUrl)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('Could not connect to MongoDB', err);
    });
};
