import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRoles('teacher', 'admin'));

router.get('/teacher/classes', async (_req, res) => {
	return res.json({ classes: [] });
});

export default router;


