import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth';
import { UserModel } from '../models/User';

const router = Router();

router.use(requireAuth, requireRoles('admin'));

router.get('/admin/users', async (_req, res) => {
	const users = await UserModel.find({}, { passwordHash: 0 }).lean();
	return res.json(users);
});

export default router;


