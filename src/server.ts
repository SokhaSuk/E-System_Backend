/**
 * Application HTTP server entrypoint.
 *
 * - Initializes database connection
 * - Configures Express middlewares (CORS, JSON parsing, logging)
 * - Mounts feature routers under `/api`
 * - Exposes a simple `/health` probe
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { connectToDatabase } from './config/db';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';

/**
 * Boots the server after a successful DB connection.
 */
async function bootstrap() {
	await connectToDatabase();
	const app = express();

	app.use(cors());
	app.use(express.json());
	app.use(morgan('dev'));

	app.get('/health', (_req, res) => res.json({ status: 'ok' }));

	app.use('/api', authRoutes);
	app.use('/api', adminRoutes);
	app.use('/api', teacherRoutes);
	app.use('/api', studentRoutes);

	// Fallback 404 for unmatched routes
	app.use((req, res, _next) => res.status(404).json({ message: 'Not found' }));

	app.listen(env.port, () => {
		console.log(`API listening on port ${env.port}`);
	});
}

bootstrap().catch((err) => {
	console.error('Failed to start server', err);
	process.exit(1);
});


