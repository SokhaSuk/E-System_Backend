/**
 * Blockchain Service
 * 
 * Provides blockchain integration for immutable record storage.
 * Stores hashes of academic records (grades, certificates, attendance) on blockchain.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectToDatabase } from './config/db';
import { blockchainRouter } from './routes/blockchain';
import { healthRouter } from './routes/health';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
	origin: env.cors.origin,
	credentials: env.cors.credentials,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.nodeEnv === 'development') {
	app.use(morgan('dev'));
} else {
	app.use(morgan('combined'));
}

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/blockchain', blockchainRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
	try {
		await connectToDatabase();
		
		// Initialize blockchain connection
		await initializeBlockchain();
		
		app.listen(env.port, () => {
			console.log(`⛓️  Blockchain Service running on port ${env.port}`);
			console.log(`Environment: ${env.nodeEnv}`);
		});
	} catch (error) {
		console.error('Failed to start Blockchain Service:', error);
		process.exit(1);
	}
}

async function initializeBlockchain() {
	// Initialize blockchain connection based on configuration
	if (env.blockchain.provider === 'ethereum') {
		console.log('Connecting to Ethereum network...');
		// Ethereum initialization would go here
	} else if (env.blockchain.provider === 'hyperledger') {
		console.log('Connecting to Hyperledger Fabric...');
		// Hyperledger initialization would go here
	} else {
		console.log('Using local blockchain simulation...');
		// Local blockchain simulation
	}
}

if (require.main === module) {
	startServer();
}

export { app };

