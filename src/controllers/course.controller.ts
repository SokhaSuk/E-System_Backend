/**
 * Course controllers.
 */
import { Request, Response } from 'express';
import { CourseModel } from '../models/Course';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';

export async function listCourses(req: Request, res: Response) {
	const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', teacher, semester, academicYear, isActive, search } = req.query as any;

	const filter: any = {};
	if (teacher) filter.teacher = teacher;
	if (semester) filter.semester = semester;
	if (academicYear) filter.academicYear = academicYear;
	if (isActive !== undefined) filter.isActive = isActive;
	if (search) {
		filter.$or = [
			{ title: { $regex: search, $options: 'i' } },
			{ description: { $regex: search, $options: 'i' } },
			{ code: { $regex: search, $options: 'i' } }
		];
	}

	const skip = (Number(page) - 1) * Number(limit);
	const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

	const [courses, total] = await Promise.all([
		CourseModel.find(filter)
			.populate('teacher', 'fullName email')
			.populate('students', 'fullName email')
			.sort(sort)
			.skip(skip)
			.limit(Number(limit)),
		CourseModel.countDocuments(filter)
	]);

	return res.json({
		courses,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total,
			pages: Math.ceil(total / Number(limit))
		}
	});
}

export async function getCourse(req: Request, res: Response) {
	const course = await CourseModel.findById(req.params.id)
		.populate('teacher', 'fullName email')
		.populate('students', 'fullName email');
	if (!course) {
		throw createError('Course not found', 404);
	}
	return res.json(course);
}

export async function createCourse(req: Request, res: Response) {
	const { title, description, code, credits, semester, academicYear } = req.body;

	const existingCourse = await CourseModel.findOne({ code });
	if (existingCourse) {
		throw createError('Course code already exists', 409);
	}

	const course = new CourseModel({
		title,
		description,
		code,
		credits,
		teacher: req.user!._id,
		semester,
		academicYear
	});

	await course.save();
	await course.populate('teacher', 'fullName email');

	return res.status(201).json(course);
}

export async function updateCourse(req: Request, res: Response) {
	const course = await CourseModel.findById(req.params.id);
	if (!course) {
		throw createError('Course not found', 404);
	}

	// Only the course teacher or admin can update
	if (req.user!.role !== 'admin' && course.teacher.toString() !== req.user!._id.toString()) {
		throw createError('Not authorized to update this course', 403);
	}

	Object.assign(course, req.body);
	await course.save();
	await course.populate('teacher', 'fullName email');

	return res.json(course);
}

export async function enrollStudent(req: Request, res: Response) {
	const { studentId } = req.body as { studentId: string };
	const course = await CourseModel.findById(req.params.id);
	if (!course) {
		throw createError('Course not found', 404);
	}

	if (req.user!.role !== 'admin' && course.teacher.toString() !== req.user!._id.toString()) {
		throw createError('Not authorized to enroll students in this course', 403);
	}

	const student = await UserModel.findById(studentId);
	if (!student || student.role !== 'student') {
		throw createError('Invalid student ID', 400);
	}

	if (course.students.map(id => id.toString()).includes(studentId)) {
		throw createError('Student is already enrolled in this course', 409);
	}

	course.students.push(studentId as any);
	await course.save();
	await course.populate('students', 'fullName email');

	return res.json(course);
}

export async function removeStudent(req: Request, res: Response) {
	const course = await CourseModel.findById(req.params.id);
	if (!course) {
		throw createError('Course not found', 404);
	}

	if (req.user!.role !== 'admin' && course.teacher.toString() !== req.user!._id.toString()) {
		throw createError('Not authorized to remove students from this course', 403);
	}

	course.students = course.students.filter(id => id.toString() !== req.params.studentId);
	await course.save();
	await course.populate('students', 'fullName email');

	return res.json(course);
}

export async function deleteCourse(req: Request, res: Response) {
	const course = await CourseModel.findByIdAndDelete(req.params.id);
	if (!course) {
		throw createError('Course not found', 404);
	}
	return res.json({ message: 'Course deleted successfully' });
}


