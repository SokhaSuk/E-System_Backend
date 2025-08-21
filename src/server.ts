import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { connectToDatabase } from './config/db';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';

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

	app.use((req, res, _next) => res.status(404).json({ message: 'Not found' }));

	app.listen(env.port, () => {
		console.log(`API listening on port ${env.port}`);
	});
}

bootstrap().catch((err) => {
	console.error('Failed to start server', err);
	process.exit(1);
});


