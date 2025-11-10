/**
 * API Gateway Service
 * 
 * Main entry point for all client requests.
 * Routes requests to appropriate microservices.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { serviceRegistry } from './services/registry';
import { authMiddleware } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { proxyRouter } from './routes/proxy';
import { healthRouter } from './routes/health';

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

// Health check
app.use('/health', healthRouter);

// API routes
app.use('/api/v1', proxyRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
	try {
		// Register services
		await serviceRegistry.initialize();
		
		app.listen(env.port, () => {
			console.log(`🚀 API Gateway running on port ${env.port}`);
			console.log(`Environment: ${env.nodeEnv}`);
			console.log(`Health check: http://localhost:${env.port}/health`);
		});
	} catch (error) {
		console.error('Failed to start API Gateway:', error);
		process.exit(1);
	}
}

if (require.main === module) {
	startServer();
}

export { app };

