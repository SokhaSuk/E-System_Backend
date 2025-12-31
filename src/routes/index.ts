/**
 * Central API router that mounts feature routers.
 */
import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import teacherRoutes from './teacher.routes';
import studentRoutes from './student.routes';
import courseRoutes from './course.routes';
import attendanceRoutes from './attendance.routes';
import userRoutes from './user.routes';
import gradeRoutes from './grade.routes';
import announcementRoutes from './announcement.routes';
import dataRoutes from './data.routes';
import chatRoutes from './chat.routes';
import scoreRecordRoutes from './scorerecord.routes.js';
const router = Router();

// API documentation/root endpoint
router.get('/', (_req, res) => {
	return res.json({
		message: 'E-System API',
		version: '1.0.0',
		endpoints: {
			health: '/health',
			auth: '/api/v1/auth',
			admin: '/api/v1/admin',
			teacher: '/api/v1/teacher',
			student: '/api/v1/student',
			courses: '/api/v1/courses',
			attendance: '/api/v1/attendance',
			users: '/api/v1/users',
			grades: '/api/v1/grades',
			announcements: '/api/v1/announcements',
			chat: '/api/v1/chat',
			scorerecords: '/api/v1/scorerecords',
		},
		docs: {
			openapi: '/openapi.json',
			swaggerUi: '/api-docs',
		},
	});
});

// Feature routers
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/users', userRoutes);
router.use('/grades', gradeRoutes);
router.use('/announcements', announcementRoutes);
router.use('/data', dataRoutes);
router.use('/chat', chatRoutes);
router.use('/scorerecords', scoreRecordRoutes);

export default router;
