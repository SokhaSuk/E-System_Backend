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

const router = Router();

// API documentation/root endpoint
router.get('/', (_req, res) => {
	return res.json({
		message: 'E-System API',
		version: '1.0.0',
		endpoints: {
			health: '/health',
			auth: '/api/auth',
			admin: '/api/admin',
			teacher: '/api/teacher',
			student: '/api/student',
			courses: '/api/courses',
			attendance: '/api/attendance'
		}
	});
});

// Feature routers
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/teacher', teacherRoutes);
router.use('/student', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/attendance', attendanceRoutes);

export default router;


