/**
 * User management controllers for school system.
 */
import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

export async function listUsers(req: Request, res: Response) {
	const {
		page = 1,
		limit = 10,
		sortBy = 'createdAt',
		sortOrder = 'desc',
		role,
		search,
	} = req.query as any;

	const filter: any = {};

	// Role-based filtering
	if (req.user!.role === 'teacher') {
		filter.role = 'student';
	} else if (req.user!.role === 'student') {
		throw createError('Students cannot view other users', 403);
	}

	if (role && req.user!.role === 'admin') {
		filter.role = role;
	}

	if (search) {
		filter.$or = [
			{ fullName: { $regex: search, $options: 'i' } },
			{ email: { $regex: search, $options: 'i' } },
		];
	}

	const skip = (Number(page) - 1) * Number(limit);
	const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

	const [users, total] = await Promise.all([
		UserModel.find(filter)
			.select('-passwordHash')
			.sort(sort)
			.skip(skip)
			.limit(Number(limit)),
		UserModel.countDocuments(filter),
	]);

	return res.json({
		users,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total,
			pages: Math.ceil(total / Number(limit)),
		},
	});
}

export async function getUser(req: Request, res: Response) {
	const { id } = req.params;

	// Students can only view their own profile
	if (req.user!.role === 'student' && id !== req.user!._id.toString()) {
		throw createError('Students can only view their own profile', 403);
	}

	// Teachers can only view student profiles
	if (req.user!.role === 'teacher' && id !== req.user!._id.toString()) {
		const targetUser = await UserModel.findById(id).select('-passwordHash');
		if (!targetUser) {
			throw createError('User not found', 404);
		}
		if (targetUser.role !== 'student') {
			throw createError('Teachers can only view student profiles', 403);
		}
		return res.json(targetUser);
	}

	const user = await UserModel.findById(id).select('-passwordHash');
	if (!user) {
		throw createError('User not found', 404);
	}

	return res.json(user);
}

export async function createUser(req: Request, res: Response) {
	// Only admins can create users
	if (req.user!.role !== 'admin') {
		throw createError('Only administrators can create users', 403);
	}

	const { fullName, email, password, role = 'student' } = req.body;

	// Validate required fields
	if (!fullName || !email || !password) {
		throw createError('Full name, email, and password are required', 400);
	}

	// Check if user already exists
	const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
	if (existingUser) {
		throw createError('User with this email already exists', 409);
	}

	// Hash password
	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltRounds);

	const user = new UserModel({
		fullName,
		email: email.toLowerCase(),
		passwordHash,
		role,
	});

	await user.save();

	// Return user without password hash
	const userResponse = user.toObject();
	delete userResponse.passwordHash;

	return res.status(201).json(userResponse);
}

export async function updateUser(req: Request, res: Response) {
	const { id } = req.params;

	// Users can update their own profile, admins can update any profile
	if (req.user!.role !== 'admin' && id !== req.user!._id.toString()) {
		throw createError('Not authorized to update this user', 403);
	}

	const user = await UserModel.findById(id);
	if (!user) {
		throw createError('User not found', 404);
	}

	// Only admins can change user roles
	if (req.body.role && req.user!.role !== 'admin') {
		throw createError('Only administrators can change user roles', 403);
	}

	// Students cannot change their role
	if (req.body.role && user.role === 'student') {
		throw createError('Students cannot change their role', 403);
	}

	// Update user fields
	Object.assign(user, req.body);
	await user.save();

	// Return user without password hash
	const userResponse = user.toObject();
	delete userResponse.passwordHash;

	return res.json(userResponse);
}

export async function changePassword(req: Request, res: Response) {
	const { id } = req.params;
	const { currentPassword, newPassword } = req.body;

	// Users can only change their own password, admins can change any password
	if (req.user!.role !== 'admin' && id !== req.user!._id.toString()) {
		throw createError('Not authorized to change this password', 403);
	}

	if (!newPassword || newPassword.length < 6) {
		throw createError('New password must be at least 6 characters long', 400);
	}

	const user = await UserModel.findById(id);
	if (!user) {
		throw createError('User not found', 404);
	}

	// If not admin, verify current password
	if (req.user!.role !== 'admin') {
		const isValidPassword = await bcrypt.compare(
			currentPassword,
			user.passwordHash
		);
		if (!isValidPassword) {
			throw createError('Current password is incorrect', 400);
		}
	}

	// Hash new password
	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(newPassword, saltRounds);

	user.passwordHash = passwordHash;
	await user.save();

	return res.json({ message: 'Password updated successfully' });
}

export async function deleteUser(req: Request, res: Response) {
	// Only admins can delete users
	if (req.user!.role !== 'admin') {
		throw createError('Only administrators can delete users', 403);
	}

	const { id } = req.params;

	const user = await UserModel.findByIdAndDelete(id);
	if (!user) {
		throw createError('User not found', 404);
	}

	return res.json({ message: 'User deleted successfully' });
}

export async function getUserProfile(req: Request, res: Response) {
	// Return current user's profile without password hash
	const user = await UserModel.findById(req.user!._id).select('-passwordHash');
	if (!user) {
		throw createError('User not found', 404);
	}

	return res.json(user);
}

export async function updateUserProfile(req: Request, res: Response) {
	const user = await UserModel.findById(req.user!._id);
	if (!user) {
		throw createError('User not found', 404);
	}

	// Students cannot change their role through profile update
	if (req.body.role) {
		throw createError('Cannot change role through profile update', 403);
	}

	// Update allowed fields
	const allowedFields = ['fullName', 'email'];
	const updates: any = {};
	allowedFields.forEach(field => {
		if (req.body[field] !== undefined) {
			updates[field] = req.body[field];
		}
	});

	Object.assign(user, updates);
	await user.save();

	// Return user without password hash
	const userResponse = user.toObject();
	delete userResponse.passwordHash;

	return res.json(userResponse);
}
