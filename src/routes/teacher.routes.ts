/**
 * Teacher routes.
 * Accessible by users with roles: teacher, admin.
 */
import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRoles('teacher', 'admin'));

/** Placeholder: returns an empty list of classes. */
router.get('/teacher/classes', async (_req, res) => {
	return res.json({ classes: [] });
});

export default router;


