/**
 * Database connection helper for Mongoose.
 *
 * Establishes a single connection using the `MONGO_URI` from env.
 */
import mongoose from 'mongoose';
import { env } from './env';

/** Connects to MongoDB using Mongoose. */
export async function connectToDatabase(): Promise<void> {
	await mongoose.connect(env.mongoUri);
}




