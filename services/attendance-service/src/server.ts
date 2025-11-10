/**
 * Attendance Service with Blockchain Integration
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectToDatabase } from './config/db';
import { attendanceRouter } from './routes/attendance';
import { healthRouter } from './routes/health';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
	origin: env.cors.origin,
	credentials: env.cors.credentials,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.nodeEnv === 'development') {
	app.use(morgan('dev'));
} else {
	app.use(morgan('combined'));
}

app.use('/health', healthRouter);
app.use('/api/v1/attendance', attendanceRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
	try {
		await connectToDatabase();
		app.listen(env.port, () => {
			console.log(`📅 Attendance Service running on port ${env.port}`);
		});
	} catch (error) {
		console.error('Failed to start Attendance Service:', error);
		process.exit(1);
	}
}

if (require.main === module) {
	startServer();
}

export { app };

