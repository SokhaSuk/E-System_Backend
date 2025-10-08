/**
 * Announcement management controllers for school system.
 */
import { Request, Response } from 'express';
import { AnnouncementModel } from '../models/Announcement';
import { CourseModel } from '../models/Course';
import { createError } from '../middleware/errorHandler';

export async function listAnnouncements(req: Request, res: Response) {
	const {
		page = 1,
		limit = 10,
		sortBy = 'publishedAt',
		sortOrder = 'desc',
		type,
		course,
		author,
		targetAudience,
		isActive,
		search,
	} = req.query as any;

	const filter: any = {};

	// Role-based filtering
	if (req.user!.role === 'student') {
		// Students can only see active announcements targeted to them
		filter.isActive = true;
		filter.$or = [{ targetAudience: 'all' }, { targetAudience: 'student' }];
	} else if (req.user!.role === 'teacher') {
		// Teachers can see announcements targeted to them or all
		filter.isActive = true;
		filter.$or = [{ targetAudience: 'all' }, { targetAudience: 'teacher' }];
	}
	// Admins can see all announcements

	if (type) filter.type = type;
	if (course) filter.course = course;
	if (author) filter.author = author;
	if (targetAudience && req.user!.role === 'admin') {
		filter.targetAudience = targetAudience;
	}
	if (isActive !== undefined) filter.isActive = isActive;

	if (search) {
		filter.$or = [
			{ title: { $regex: search, $options: 'i' } },
			{ content: { $regex: search, $options: 'i' } },
		];
	}

	const skip = (Number(page) - 1) * Number(limit);
	const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

	const [announcements, total] = await Promise.all([
		AnnouncementModel.find(filter)
			.populate('author', 'fullName email')
			.populate('course', 'title code')
			.sort(sort)
			.skip(skip)
			.limit(Number(limit)),
		AnnouncementModel.countDocuments(filter),
	]);

	return res.json({
		announcements,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total,
			pages: Math.ceil(total / Number(limit)),
		},
	});
}

export async function getAnnouncement(req: Request, res: Response) {
	const { id } = req.params;

	const announcement = await AnnouncementModel.findById(id)
		.populate('author', 'fullName email')
		.populate('course', 'title code');

	if (!announcement) {
		throw createError('Announcement not found', 404);
	}

	// Check if user can view this announcement
	if (req.user!.role === 'student') {
		if (
			!announcement.isActive ||
			(!announcement.targetAudience.includes('all') &&
				!announcement.targetAudience.includes('student'))
		) {
			throw createError('Not authorized to view this announcement', 403);
		}
	} else if (req.user!.role === 'teacher') {
		if (
			!announcement.isActive ||
			(!announcement.targetAudience.includes('all') &&
				!announcement.targetAudience.includes('teacher'))
		) {
			throw createError('Not authorized to view this announcement', 403);
		}
	}

	return res.json(announcement);
}

export async function createAnnouncement(req: Request, res: Response) {
	// Only teachers and admins can create announcements
	if (req.user!.role !== 'admin' && req.user!.role !== 'teacher') {
		throw createError(
			'Only teachers and administrators can create announcements',
			403
		);
	}

	const {
		title,
		content,
		type,
		targetAudience,
		courseId,
		expiresAt,
		attachments,
	} = req.body;

	// Validate required fields
	if (!title || !content || !type) {
		throw createError('Title, content, and type are required', 400);
	}

	// Validate announcement type
	const validTypes = ['general', 'course', 'academic', 'emergency'];
	if (!validTypes.includes(type)) {
		throw createError('Invalid announcement type', 400);
	}

	// Validate target audience
	const validAudiences = ['admin', 'teacher', 'student', 'all'];
	if (
		!targetAudience ||
		!Array.isArray(targetAudience) ||
		!targetAudience.every(a => validAudiences.includes(a))
	) {
		throw createError('Invalid target audience', 400);
	}

	// If it's a course announcement, validate course exists and teacher has permission
	if (type === 'course') {
		if (!courseId) {
			throw createError('Course ID is required for course announcements', 400);
		}

		const course = await CourseModel.findById(courseId);
		if (!course) {
			throw createError('Course not found', 404);
		}

		// Teachers can only create announcements for their own courses
		if (
			req.user!.role === 'teacher' &&
			course.teacher.toString() !== req.user!._id.toString()
		) {
			throw createError(
				'Not authorized to create announcements for this course',
				403
			);
		}
	}

	const announcement = new AnnouncementModel({
		title,
		content,
		type,
		author: req.user!._id,
		targetAudience,
		course: courseId,
		expiresAt: expiresAt ? new Date(expiresAt) : undefined,
		attachments,
		publishedAt: new Date(),
	});

	await announcement.save();
	await announcement.populate([
		{ path: 'author', select: 'fullName email' },
		{ path: 'course', select: 'title code' },
	]);

	return res.status(201).json(announcement);
}

export async function updateAnnouncement(req: Request, res: Response) {
	const { id } = req.params;

	const announcement = await AnnouncementModel.findById(id);
	if (!announcement) {
		throw createError('Announcement not found', 404);
	}

	// Only the author or admin can update
	if (
		req.user!.role !== 'admin' &&
		announcement.author.toString() !== req.user!._id.toString()
	) {
		throw createError('Not authorized to update this announcement', 403);
	}

	// Update fields
	Object.assign(announcement, req.body);
	await announcement.save();

	await announcement.populate([
		{ path: 'author', select: 'fullName email' },
		{ path: 'course', select: 'title code' },
	]);

	return res.json(announcement);
}

export async function deleteAnnouncement(req: Request, res: Response) {
	const { id } = req.params;

	const announcement = await AnnouncementModel.findById(id);
	if (!announcement) {
		throw createError('Announcement not found', 404);
	}

	// Only the author or admin can delete
	if (
		req.user!.role !== 'admin' &&
		announcement.author.toString() !== req.user!._id.toString()
	) {
		throw createError('Not authorized to delete this announcement', 403);
	}

	await AnnouncementModel.findByIdAndDelete(id);

	return res.json({ message: 'Announcement deleted successfully' });
}

export async function toggleAnnouncementStatus(req: Request, res: Response) {
	const { id } = req.params;

	const announcement = await AnnouncementModel.findById(id);
	if (!announcement) {
		throw createError('Announcement not found', 404);
	}

	// Only the author or admin can toggle status
	if (
		req.user!.role !== 'admin' &&
		announcement.author.toString() !== req.user!._id.toString()
	) {
		throw createError('Not authorized to change announcement status', 403);
	}

	announcement.isActive = !announcement.isActive;
	await announcement.save();

	return res.json({
		message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'} successfully`,
		announcement,
	});
}

export async function getActiveAnnouncements(req: Request, res: Response) {
	const filter: any = {
		isActive: true,
		$or: [
			{ targetAudience: 'all' },
			{ targetAudience: req.user!.role },
			{ targetAudience: 'student' }, // For backward compatibility
		],
	};

	// Check if announcement is expired
	const now = new Date();
	filter.$or.push({
		$or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
	});

	const announcements = await AnnouncementModel.find(filter)
		.populate('author', 'fullName email')
		.populate('course', 'title code')
		.sort({ publishedAt: -1 });

	return res.json(announcements);
}

export async function getAnnouncementsByCourse(req: Request, res: Response) {
	const { courseId } = req.params;

	// Check if course exists
	const course = await CourseModel.findById(courseId);
	if (!course) {
		throw createError('Course not found', 404);
	}

	// Check permissions for non-admin users
	if (
		req.user!.role === 'teacher' &&
		course.teacher.toString() !== req.user!._id.toString()
	) {
		throw createError(
			'Not authorized to view announcements for this course',
			403
		);
	}

	const filter: any = {
		course: courseId,
		isActive: true,
	};

	// Role-based audience filtering
	if (req.user!.role === 'student') {
		filter.$or = [{ targetAudience: 'all' }, { targetAudience: 'student' }];
	} else if (req.user!.role === 'teacher') {
		filter.$or = [{ targetAudience: 'all' }, { targetAudience: 'teacher' }];
	}

	const announcements = await AnnouncementModel.find(filter)
		.populate('author', 'fullName email')
		.sort({ publishedAt: -1 });

	return res.json(announcements);
}

export async function getUserAnnouncements(req: Request, res: Response) {
	// Get announcements authored by the current user
	const announcements = await AnnouncementModel.find({ author: req.user!._id })
		.populate('course', 'title code')
		.sort({ publishedAt: -1 });

	return res.json(announcements);
}

export async function markAnnouncementAsRead(req: Request, res: Response) {
	const { id } = req.params;

	// In a real application, you might want to track read status per user
	// For now, we'll just return success
	const announcement = await AnnouncementModel.findById(id)
		.populate('author', 'fullName email')
		.populate('course', 'title code');

	if (!announcement) {
		throw createError('Announcement not found', 404);
	}

	// Check if user can view this announcement (same logic as getAnnouncement)
	if (req.user!.role === 'student') {
		if (
			!announcement.isActive ||
			(!announcement.targetAudience.includes('all') &&
				!announcement.targetAudience.includes('student'))
		) {
			throw createError('Not authorized to view this announcement', 403);
		}
	} else if (req.user!.role === 'teacher') {
		if (
			!announcement.isActive ||
			(!announcement.targetAudience.includes('all') &&
				!announcement.targetAudience.includes('teacher'))
		) {
			throw createError('Not authorized to view this announcement', 403);
		}
	}

	return res.json({
		message: 'Announcement marked as read',
		announcement,
	});
}
