import mongoose from 'mongoose';
import { config } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`✅ Grade Service: MongoDB connected to ${config.mongoUri}`);
  } catch (error) {
    console.error('❌ Grade Service: MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Grade Service: MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Grade Service: MongoDB error:', error);
});
