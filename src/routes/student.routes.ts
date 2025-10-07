
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize(['student', 'admin']));

/** Placeholder: returns an empty list of courses. */
router.get('/courses', async (_req, res) => {
	return res.json({ courses: [] });
});
export default router;
