/**
 * Auth Service
 * 
 * Handles authentication and authorization for the E-System.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectToDatabase } from './config/db';
import { authRouter } from './routes/auth';
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
app.use('/api/v1/auth', authRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
	try {
		await connectToDatabase();
		
		app.listen(env.port, () => {
			console.log(`🔐 Auth Service running on port ${env.port}`);
			console.log(`Environment: ${env.nodeEnv}`);
		});
	} catch (error) {
		console.error('Failed to start Auth Service:', error);
		process.exit(1);
	}
}

if (require.main === module) {
	startServer();
}

export { app };

