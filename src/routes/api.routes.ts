/**
 * Comprehensive API routes with CRUD operations.
 * 
 * This file provides RESTful endpoints for:
 * - Users (GET, POST, PUT, DELETE)
 * - Courses (GET, POST, PUT, DELETE)
 * - Authentication (POST login, POST register)
 * - Profile management
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, UserRole } from '../models/User';
import { CourseModel } from '../models/Course';
import { verifyPassword, hashPassword } from '../utils/password';
import { env } from '../config/env';
import { authenticate } from '../middleware/auth';

const router = Router();

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * POST /api/register - Register a new user
 * Body: { fullName, email, password, role?, adminCode? }
 */
router.post('/register', async (req: Request, res: Response) => {
	try {
		const { fullName, email, password, role, adminCode } = req.body as {
			fullName: string;
			email: string;
			password: string;
			role?: UserRole;
			adminCode?: string;
		};

		if (!fullName || !email || !password) {
			return res.status(400).json({ 
				success: false,
				message: 'fullName, email and password are required' 
			});
		}

		const existing = await UserModel.findOne({ email });
		if (existing) {
			return res.status(409).json({ 
				success: false,
				message: 'Email already in use' 
			});
		}

		let finalRole: UserRole = role || 'student';
		if (finalRole === 'admin') {
			if (!env.adminSignupCode || adminCode !== env.adminSignupCode) {
				return res.status(403).json({ 
					success: false,
					message: 'Admin signup code is invalid' 
				});
			}
		}

		const passwordHash = await hashPassword(password);
		const user = await UserModel.create({ 
			fullName, 
			email, 
			passwordHash, 
			role: finalRole 
		});

		return res.status(201).json({ 
			success: true,
			data: {
				id: user._id.toString(), 
				fullName: user.fullName, 
				email: user.email, 
				role: user.role 
			}
		});
	} catch (err) {
		console.error('Registration error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Registration failed' 
		});
	}
});

/**
 * POST /api/login - Authenticate user and return JWT
 * Body: { email, password }
 */
router.post('/login', async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body as { 
			email: string; 
			password: string 
		};

		if (!email || !password) {
			return res.status(400).json({ 
				success: false,
				message: 'Email and password are required' 
			});
		}

		const user = await UserModel.findOne({ email });
		if (!user) {
			return res.status(401).json({ 
				success: false,
				message: 'Invalid credentials' 
			});
		}

		const ok = await verifyPassword(password, user.passwordHash);
		if (!ok) {
			return res.status(401).json({ 
				success: false,
				message: 'Invalid credentials' 
			});
		}

		const token = jwt.sign(
			{ userId: user._id.toString(), role: user.role }, 
			env.jwtSecret, 
			{ expiresIn: '7d' }
		);

		return res.json({ 
			success: true,
			data: {
				token, 
				user: { 
					id: user._id.toString(), 
					fullName: user.fullName, 
					email: user.email, 
					role: user.role 
				} 
			}
		});
	} catch (err) {
		console.error('Login error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Login failed' 
		});
	}
});

// ============================================================================
// USER ENDPOINTS (Protected routes)
// ============================================================================

/**
 * GET /api/users - Get all users (Admin only)
 */
router.get('/users', authenticate, async (req: Request, res: Response) => {
	try {
		// Check if user is admin
		if (req.user!.role !== 'admin') {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied. Admin role required.' 
			});
		}

		const users = await UserModel.find({}, { passwordHash: 0 });
		
		return res.json({ 
			success: true,
			data: users.map(user => ({
				id: user._id.toString(),
				fullName: user.fullName,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			}))
		});
	} catch (err) {
		console.error('Get users error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to fetch users' 
		});
	}
});

/**
 * GET /api/users/:id - Get user by ID
 */
router.get('/users/:id', authenticate, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		
		// Users can only access their own profile unless they're admin
		if (req.user!.role !== 'admin' && req.user!._id.toString() !== id) {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied' 
			});
		}

		const user = await UserModel.findById(id, { passwordHash: 0 });
		if (!user) {
			return res.status(404).json({ 
				success: false,
				message: 'User not found' 
			});
		}

		return res.json({ 
			success: true,
			data: {
				id: user._id.toString(),
				fullName: user.fullName,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			}
		});
	} catch (err) {
		console.error('Get user error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to fetch user' 
		});
	}
});

/**
 * PUT /api/users/:id - Update user
 */
router.put('/users/:id', authenticate, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { fullName, email, role } = req.body;

		// Users can only update their own profile unless they're admin
		if (req.user!.role !== 'admin' && req.user!._id.toString() !== id) {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied' 
			});
		}

		// Only admins can change roles
		if (role && req.user!.role !== 'admin') {
			return res.status(403).json({ 
				success: false,
				message: 'Only admins can change user roles' 
			});
		}

		const updateData: any = {};
		if (fullName) updateData.fullName = fullName;
		if (email) updateData.email = email;
		if (role && req.user!.role === 'admin') updateData.role = role;

		const user = await UserModel.findByIdAndUpdate(
			id, 
			updateData, 
			{ new: true, runValidators: true }
		).select('-passwordHash');

		if (!user) {
			return res.status(404).json({ 
				success: false,
				message: 'User not found' 
			});
		}

		return res.json({ 
			success: true,
			data: {
				id: user._id.toString(),
				fullName: user.fullName,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			}
		});
	} catch (err) {
		console.error('Update user error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to update user' 
		});
	}
});

/**
 * DELETE /api/users/:id - Delete user
 */
router.delete('/users/:id', authenticate, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Only admins can delete users
		if (req.user!.role !== 'admin') {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied. Admin role required.' 
			});
		}

		// Prevent admin from deleting themselves
		if (req.user!._id.toString() === id) {
			return res.status(400).json({ 
				success: false,
				message: 'Cannot delete your own account' 
			});
		}

		const user = await UserModel.findByIdAndDelete(id);
		if (!user) {
			return res.status(404).json({ 
				success: false,
				message: 'User not found' 
			});
		}

		return res.json({ 
			success: true,
			message: 'User deleted successfully' 
		});
	} catch (err) {
		console.error('Delete user error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to delete user' 
		});
	}
});

// ============================================================================
// COURSE ENDPOINTS
// ============================================================================

/**
 * GET /api/courses - Get all courses
 */
router.get('/courses', authenticate, async (req: Request, res: Response) => {
	try {
		const { role } = req.user!;
		const userId = req.user!._id.toString();
		let query: any = { isActive: true };

		// Filter courses based on user role
		if (role === 'teacher') {
			query.teacher = userId;
		} else if (role === 'student') {
			query.students = userId;
		}
		// Admins can see all courses

		const courses = await CourseModel.find(query)
			.populate('teacher', 'fullName email')
			.populate('students', 'fullName email');

		return res.json({ 
			success: true,
			data: courses.map(course => ({
				id: course._id.toString(),
				title: course.title,
				description: course.description,
				code: course.code,
				credits: course.credits,
				teacher: course.teacher,
				students: course.students,
				semester: course.semester,
				academicYear: course.academicYear,
				isActive: course.isActive,
				createdAt: course.createdAt,
				updatedAt: course.updatedAt
			}))
		});
	} catch (err) {
		console.error('Get courses error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to fetch courses' 
		});
	}
});

/**
 * GET /api/courses/:id - Get course by ID
 */
router.get('/courses/:id', authenticate, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { role } = req.user!;
		const userId = req.user!._id.toString();

		const course = await CourseModel.findById(id)
			.populate('teacher', 'fullName email')
			.populate('students', 'fullName email');

		if (!course) {
			return res.status(404).json({ 
				success: false,
				message: 'Course not found' 
			});
		}

		// Check access permissions
		if (role === 'student' && !course.students.some(student => 
			student._id.toString() === userId
		)) {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied' 
			});
		}

		if (role === 'teacher' && course.teacher._id.toString() !== userId) {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied' 
			});
		}

		return res.json({ 
			success: true,
			data: {
				id: course._id.toString(),
				title: course.title,
				description: course.description,
				code: course.code,
				credits: course.credits,
				teacher: course.teacher,
				students: course.students,
				semester: course.semester,
				academicYear: course.academicYear,
				isActive: course.isActive,
				createdAt: course.createdAt,
				updatedAt: course.updatedAt
			}
		});
	} catch (err) {
		console.error('Get course error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to fetch course' 
		});
	}
});

/**
 * POST /api/courses - Create new course
 */
router.post('/courses', authenticate, async (req: Request, res: Response) => {
	try {
		const { role } = req.user!;
		const userId = req.user!._id.toString();
		
		// Only teachers and admins can create courses
		if (role === 'student') {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied. Teachers and admins only.' 
			});
		}

		const { 
			title, 
			description, 
			code, 
			credits, 
			teacher, 
			semester, 
			academicYear 
		} = req.body;

		if (!title || !description || !code || !credits || !semester || !academicYear) {
			return res.status(400).json({ 
				success: false,
				message: 'All fields are required' 
			});
		}

		// Check if course code already exists
		const existingCourse = await CourseModel.findOne({ code });
		if (existingCourse) {
			return res.status(409).json({ 
				success: false,
				message: 'Course code already exists' 
			});
		}

		// Set teacher based on role
		const teacherId = role === 'admin' ? teacher : userId;

		const course = await CourseModel.create({
			title,
			description,
			code,
			credits,
			teacher: teacherId,
			semester,
			academicYear
		});

		const populatedCourse = await CourseModel.findById(course._id)
			.populate('teacher', 'fullName email')
			.populate('students', 'fullName email');

		return res.status(201).json({ 
			success: true,
			data: {
				id: populatedCourse!._id.toString(),
				title: populatedCourse!.title,
				description: populatedCourse!.description,
				code: populatedCourse!.code,
				credits: populatedCourse!.credits,
				teacher: populatedCourse!.teacher,
				students: populatedCourse!.students,
				semester: populatedCourse!.semester,
				academicYear: populatedCourse!.academicYear,
				isActive: populatedCourse!.isActive,
				createdAt: populatedCourse!.createdAt,
				updatedAt: populatedCourse!.updatedAt
			}
		});
	} catch (err) {
		console.error('Create course error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to create course' 
		});
	}
});

/**
 * PUT /api/courses/:id - Update course
 */
router.put('/courses/:id', authenticate, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { role } = req.user!;
		const userId = req.user!._id.toString();

		const course = await CourseModel.findById(id);
		if (!course) {
			return res.status(404).json({ 
				success: false,
				message: 'Course not found' 
			});
		}

		// Check permissions
		if (role === 'teacher' && course.teacher.toString() !== userId) {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied' 
			});
		}

		if (role === 'student') {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied. Teachers and admins only.' 
			});
		}

		const updateData = req.body;
		delete updateData._id; // Prevent ID modification

		const updatedCourse = await CourseModel.findByIdAndUpdate(
			id, 
			updateData, 
			{ new: true, runValidators: true }
		).populate('teacher', 'fullName email')
		 .populate('students', 'fullName email');

		return res.json({ 
			success: true,
			data: {
				id: updatedCourse!._id.toString(),
				title: updatedCourse!.title,
				description: updatedCourse!.description,
				code: updatedCourse!.code,
				credits: updatedCourse!.credits,
				teacher: updatedCourse!.teacher,
				students: updatedCourse!.students,
				semester: updatedCourse!.semester,
				academicYear: updatedCourse!.academicYear,
				isActive: updatedCourse!.isActive,
				createdAt: updatedCourse!.createdAt,
				updatedAt: updatedCourse!.updatedAt
			}
		});
	} catch (err) {
		console.error('Update course error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to update course' 
		});
	}
});

/**
 * DELETE /api/courses/:id - Delete course
 */
router.delete('/courses/:id', authenticate, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { role } = req.user!;
		const userId = req.user!._id.toString();

		const course = await CourseModel.findById(id);
		if (!course) {
			return res.status(404).json({ 
				success: false,
				message: 'Course not found' 
			});
		}

		// Check permissions
		if (role === 'teacher' && course.teacher.toString() !== userId) {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied' 
			});
		}

		if (role === 'student') {
			return res.status(403).json({ 
				success: false,
				message: 'Access denied. Teachers and admins only.' 
			});
		}

		await CourseModel.findByIdAndDelete(id);

		return res.json({ 
			success: true,
			message: 'Course deleted successfully' 
		});
	} catch (err) {
		console.error('Delete course error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to delete course' 
		});
	}
});

// ============================================================================
// PROFILE ENDPOINTS
// ============================================================================

/**
 * GET /api/profile - Get current user profile
 */
router.get('/profile', authenticate, async (req: Request, res: Response) => {
	try {
		const user = await UserModel.findById(req.user!._id, { passwordHash: 0 });
		if (!user) {
			return res.status(404).json({ 
				success: false,
				message: 'User not found' 
			});
		}

		return res.json({ 
			success: true,
			data: {
				id: user._id.toString(),
				fullName: user.fullName,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			}
		});
	} catch (err) {
		console.error('Get profile error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to fetch profile' 
		});
	}
});

/**
 * PUT /api/profile - Update current user profile
 */
router.put('/profile', authenticate, async (req: Request, res: Response) => {
	try {
		const { fullName, email } = req.body;

		const updateData: any = {};
		if (fullName) updateData.fullName = fullName;
		if (email) updateData.email = email;

		const user = await UserModel.findByIdAndUpdate(
			req.user!._id, 
			updateData, 
			{ new: true, runValidators: true }
		).select('-passwordHash');

		return res.json({ 
			success: true,
			data: {
				id: user!._id.toString(),
				fullName: user!.fullName,
				email: user!.email,
				role: user!.role,
				createdAt: user!.createdAt,
				updatedAt: user!.updatedAt
			}
		});
	} catch (err) {
		console.error('Update profile error:', err);
		return res.status(500).json({ 
			success: false,
			message: 'Failed to update profile' 
		});
	}
});

// ============================================================================
// UTILITY ENDPOINTS
// ============================================================================

/**
 * GET /api/test - Test endpoint
 */
router.get('/test', (req: Request, res: Response) => {
	res.json({
		success: true,
		message: "API is working!",
		timestamp: new Date().toISOString()
	});
});

export default router;

