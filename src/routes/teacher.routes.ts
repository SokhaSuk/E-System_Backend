/**
 * Teacher routes.
 * Accessible by users with roles: teacher, admin.
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize(['teacher', 'admin']));

/** Placeholder: returns an empty list of classes. */
router.get('/classes', async (_req, res) => {
	return res.json({ classes: [] });
});

export default router;


