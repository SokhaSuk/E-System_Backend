//Teesting
import mongoose from 'mongoose';
import { env } from './env';

/** Connects to MongoDB using Mongoose. */
export async function connectToDatabase(): Promise<void> {
	try {
		// Connection options for better reliability
		const options = {
			maxPoolSize: 10, // Maintain up to 10 socket connections
			serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
		};

		await mongoose.connect(env.mongoUri, options);
		
		console.log('✅ Successfully connected to MongoDB');
		console.log(`📊 Database: ${env.mongoUri}`);
		
		// Handle connection events
		mongoose.connection.on('error', (err) => {
			console.error('❌ MongoDB connection error:', err);
		});
		
		mongoose.connection.on('disconnected', () => {
			console.warn('⚠️ MongoDB disconnected');
		});
		
		mongoose.connection.on('reconnected', () => {
			console.log('🔄 MongoDB reconnected');
		});
		
	} catch (error) {
		console.error('❌ Failed to connect to MongoDB:', error);
		throw error;
	}
}

/** Disconnects from MongoDB. */
export async function disconnectFromDatabase(): Promise<void> {
	try {
		await mongoose.disconnect();
		console.log('✅ Disconnected from MongoDB');
	} catch (error) {
		console.error('❌ Error disconnecting from MongoDB:', error);
		throw error;
	}
}




