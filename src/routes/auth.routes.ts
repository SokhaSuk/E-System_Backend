/**
 * Authentication routes.
 *
 * - POST /auth/register: Register a new user
 * - POST /auth/login: Log a user in and return a JWT
 */
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { verifyPassword, hashPassword } from '../utils/password';
import { env } from '../config/env';

const router = Router();

/**
 * Registers a new user account.
 * Body: { fullName, email, password, role?, adminCode? }
 */
router.post('/auth/register', async (req, res) => {
	try {
		const { fullName, email, password, role, adminCode } = req.body as {
			fullName: string;
			email: string;
			password: string;
			role?: 'admin' | 'teacher' | 'student';
			adminCode?: string;
		};

		if (!fullName || !email || !password) {
			return res.status(400).json({ message: 'fullName, email and password are required' });
		}

		const existing = await UserModel.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: 'Email already in use' });
		}

		let finalRole: 'admin' | 'teacher' | 'student' = role || 'student';
		if (finalRole === 'admin') {
			if (!env.adminSignupCode || adminCode !== env.adminSignupCode) {
				return res.status(403).json({ message: 'Admin signup code is invalid' });
			}
		}

		const passwordHash = await hashPassword(password);
		const user = await UserModel.create({ fullName, email, passwordHash, role: finalRole });
		return res.status(201).json({ id: user._id.toString(), fullName: user.fullName, email: user.email, role: user.role });
	} catch (err) {
		return res.status(500).json({ message: 'Registration failed' });
	}
});

/**
 * Authenticates an existing user and returns a signed JWT.
 * Body: { email, password }
 */
router.post('/auth/login', async (req, res) => {
	try {
		const { email, password } = req.body as { email: string; password: string };
		const user = await UserModel.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		const ok = await verifyPassword(password, user.passwordHash);
		if (!ok) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		const token = jwt.sign({ userId: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: '7d' });
		return res.json({ token, user: { id: user._id.toString(), fullName: user.fullName, email: user.email, role: user.role } });
	} catch {
		return res.status(500).json({ message: 'Login failed' });
	}
});

export default router;


