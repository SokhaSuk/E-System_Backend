/**
 * Student routes.
 * Accessible by users with roles: student, admin.
 */
import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRoles('student', 'admin'));

/** Placeholder: returns an empty list of courses. */
router.get('/student/courses', async (_req, res) => {
	return res.json({ courses: [] });
});

export default router;


