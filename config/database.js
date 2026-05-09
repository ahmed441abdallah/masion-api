import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = (process.env.MONGO_URL || '').trim();

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('⚡ Using existing database connection');
    return;
  }

  // لو هو بيحاول يتصل دلوقتي، استناه وما تفتحش اتصال جديد
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB is currently connecting...');
    return;
  }

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB Successfully');
  } catch (error) {
    console.error('❌ Could not connect to MongoDB:', error.message);
  }
};
