/**
 * Database Connection
 */
import mongoose from 'mongoose';
import { env } from './env';

export async function connectToDatabase() {
	try {
		await mongoose.connect(env.mongoUri);
		console.log('✅ Connected to MongoDB (User Service)');
	} catch (error) {
		console.error('❌ MongoDB connection error:', error);
		throw error;
	}
}

