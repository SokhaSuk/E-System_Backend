/**
 * Admin-only routes.
 * Requires `requireAuth` and `requireRoles('admin')`.
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserModel } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate, authorize(['admin']));

/** Lists all users without password hashes. */
router.get('/users', asyncHandler(async (_req, res) => {
    const users = await UserModel.find({}, { passwordHash: 0 }).lean();
    return res.json(users);
}));

export default router;


