import mongoose from 'mongoose';
import { env } from './env';
import chalk from 'chalk';

/** Connects to MongoDB using Mongoose. */
export async function connectToDatabase(): Promise<void> {
	try {
		// Connection options for better reliability
		const options = {
			maxPoolSize: 10, // Maintain up to 10 socket connections
			serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
		};

		console.log(chalk.gray('⏳ Connecting to MongoDB...'));

		await mongoose.connect(env.mongoUri, options);


		console.log(chalk.green('✅ Successfully connected to MongoDB'));
		// Mask password in logs if present
		const maskedUri = env.mongoUri.replace(/(:\/\/)([^:]+):([^@]+)@/, '$1$2:*****@');
		// console.log(`📊 Database: ${chalk.cyan(maskedUri)}`);

		// Handle connection events
		mongoose.connection.on('error', err => {
			console.error(chalk.red('❌ MongoDB connection error:'), err);
		});

		mongoose.connection.on('disconnected', () => {
			console.warn(chalk.yellow('⚠️ MongoDB disconnected'));
		});

		mongoose.connection.on('reconnected', () => {
			console.log(chalk.green('🔄 MongoDB reconnected'));
		});
	} catch (error) {
		console.error(chalk.red('❌ Failed to connect to MongoDB:'), error);
		throw error;
	}
}

/** Disconnects from MongoDB. */
export async function disconnectFromDatabase(): Promise<void> {
	try {
		await mongoose.disconnect();
		console.log(chalk.green('✅ Disconnected from MongoDB'));
	} catch (error) {
		console.error(chalk.red('❌ Error disconnecting from MongoDB:'), error);
		throw error;
	}
}
