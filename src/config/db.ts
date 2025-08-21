//Teesting
import mongoose from 'mongoose';
import { env } from './env';

/** Connects to MongoDB using Mongoose. */
export async function connectToDatabase(): Promise<void> {
	await mongoose.connect(env.mongoUri);
}




