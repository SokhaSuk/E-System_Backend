import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRoles('student', 'admin'));

router.get('/student/courses', async (_req, res) => {
	return res.json({ courses: [] });
});

export default router;


