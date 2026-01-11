import mongoose from 'mongoose';
import { config } from './env';

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Auth Service: Connected to MongoDB');
  } catch (error) {
    console.error('❌ Auth Service: MongoDB connection error:', error);
    process.exit(1);
  }
};
