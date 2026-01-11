import { Request, Response } from 'express';
import { GradeModel } from '../models/Grade';
import { CourseModel } from '../models/Course';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';

export async function listGrades(req: Request, res: Response) {
	const {
		page = 1,
		limit = 10,
		sortBy = 'createdAt',
		sortOrder = 'desc',
		student,
		course,
		gradeType,
		search,
	} = req.query as any;

	const filter: any = {};

	// Role-based scoping
	if (req.user!.role === 'student') {
		filter.student = req.user!._id;
	} else if (req.user!.role === 'teacher') {
		const teacherCourseIds: any[] = await CourseModel.find({
			teacher: req.user!._id,
		}).distinct('_id');
		if (course) {
			const allowed = teacherCourseIds.map(id => id.toString());
			if (!allowed.includes(String(course))) {
				throw createError('Not authorized to view this course grades', 403);
			}
			filter.course = course;
		} else {
			filter.course = { $in: teacherCourseIds };
		}
	}

	if (student && req.user!.role !== 'student') filter.student = student;
	if (gradeType) filter.gradeType = gradeType;
	if (course && req.user!.role === 'admin') filter.course = course;
	if (search) {
		filter.$or = [{ title: { $regex: String(search), $options: 'i' } }];
	}

	const skip = (Number(page) - 1) * Number(limit);
	const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

	const [grades, total] = await Promise.all([
		GradeModel.find(filter)
			.populate('student', 'fullName email')
			.populate('course', 'title code')
			.populate('gradedBy', 'fullName')
			.sort(sort)
			.skip(skip)
			.limit(Number(limit)),
		GradeModel.countDocuments(filter),
	]);

	return res.json({
		grades,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total,
			pages: Math.ceil(total / Number(limit)),
		},
	});
}

export async function createGrade(req: Request, res: Response) {
	const {
		studentId,
		courseId,
		gradeType,
		title,
		score,
		maxScore,
		comments,
		submittedAt,
	} = req.body as any;

	const course = await CourseModel.findById(courseId);
	if (!course) throw createError('Course not found', 404);

	// Only course teacher or admin can create
	if (
		req.user!.role !== 'admin' &&
		course.teacher.toString() !== req.user!._id.toString()
	) {
		throw createError('Not authorized to create grade for this course', 403);
	}

	// Ensure student exists and is enrolled in the course
	const student = await UserModel.findById(studentId);
	if (!student || student.role !== 'student') {
		throw createError('Invalid student ID', 400);
	}
	const enrolled = course.students
		.map(id => id.toString())
		.includes(String(studentId));
	if (!enrolled) {
		throw createError('Student is not enrolled in this course', 400);
	}

	if (Number(score) > Number(maxScore)) {
		throw createError('Score cannot be greater than maxScore', 400);
	}

	const grade = new GradeModel({
		student: studentId,
		course: courseId,
		gradeType,
		title,
		score,
		maxScore,
		comments,
		submittedAt,
		gradedBy: req.user!._id,
	});
	await grade.save();
	await grade.populate([
		{ path: 'student', select: 'fullName email' },
		{ path: 'course', select: 'title code' },
		{ path: 'gradedBy', select: 'fullName' },
	]);
	return res.status(201).json(grade);
}

export async function getGrade(req: Request, res: Response) {
	const grade = await GradeModel.findById(req.params.id)
		.populate('student', 'fullName email')
		.populate('course', 'title code')
		.populate('gradedBy', 'fullName');
	if (!grade) throw createError('Grade not found', 404);

	if (req.user!.role === 'student') {
		if (grade.student.toString() !== req.user!._id.toString()) {
			throw createError('Not authorized to view this grade', 403);
		}
	}
	if (req.user!.role === 'teacher') {
		const course = await CourseModel.findById(grade.course);
		if (!course || course.teacher.toString() !== req.user!._id.toString()) {
			throw createError('Not authorized to view this grade', 403);
		}
	}
	return res.json(grade);
}

export async function updateGrade(req: Request, res: Response) {
	const grade = await GradeModel.findById(req.params.id);
	if (!grade) throw createError('Grade not found', 404);

	const course = await CourseModel.findById(grade.course);
	if (!course) throw createError('Course not found', 404);

	if (
		req.user!.role !== 'admin' &&
		course.teacher.toString() !== req.user!._id.toString()
	) {
		throw createError('Not authorized to update this grade', 403);
	}

	const updates: any = {};
	const allowed = [
		'gradeType',
		'title',
		'score',
		'maxScore',
		'comments',
		'submittedAt',
	];
	for (const key of allowed) {
		if (req.body[key] !== undefined) updates[key] = req.body[key];
	}

	// Cross-field validation for score/maxScore
	const nextScore = updates.score ?? grade.score;
	const nextMaxScore = updates.maxScore ?? grade.maxScore;
	if (Number(nextScore) > Number(nextMaxScore)) {
		throw createError('Score cannot be greater than maxScore', 400);
	}

	Object.assign(grade, updates);
	await grade.save();
	await grade.populate([
		{ path: 'student', select: 'fullName email' },
		{ path: 'course', select: 'title code' },
		{ path: 'gradedBy', select: 'fullName' },
	]);
	return res.json(grade);
}

export async function deleteGrade(req: Request, res: Response) {
	const grade = await GradeModel.findById(req.params.id);
	if (!grade) throw createError('Grade not found', 404);

	const course = await CourseModel.findById(grade.course);
	if (!course) throw createError('Course not found', 404);

	if (
		req.user!.role !== 'admin' &&
		course.teacher.toString() !== req.user!._id.toString()
	) {
		throw createError('Not authorized to delete this grade', 403);
	}

	await GradeModel.findByIdAndDelete(req.params.id);
	return res.json({ message: 'Grade deleted successfully' });
}

export async function getStudentGrades(req: Request, res: Response) {
	const { studentId } = req.params as any;
	const {
		page = 1,
		limit = 20,
		sortBy = 'createdAt',
		sortOrder = 'desc',
	} = req.query as any;

	if (req.user!.role === 'student' && studentId !== req.user!._id.toString()) {
		throw createError('Not authorized to view grades for this student', 403);
	}

	const filter: any = { student: studentId };
	if (req.user!.role === 'teacher') {
		const teacherCourseIds: any[] = await CourseModel.find({
			teacher: req.user!._id,
		}).distinct('_id');
		filter.course = { $in: teacherCourseIds };
	}

	const skip = (Number(page) - 1) * Number(limit);
	const sort: any = { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 };

	const [grades, total] = await Promise.all([
		GradeModel.find(filter)
			.populate('student', 'fullName email')
			.populate('course', 'title code')
			.populate('gradedBy', 'fullName')
			.sort(sort)
			.skip(skip)
			.limit(Number(limit)),
		GradeModel.countDocuments(filter),
	]);

	return res.json({
		grades,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total,
			pages: Math.ceil(total / Number(limit)),
		},
	});
}

export async function calculateStudentGPA(req: Request, res: Response) {
	const { studentId } = req.params as any;
	if (req.user!.role === 'student' && studentId !== req.user!._id.toString()) {
		throw createError('Not authorized to view GPA for this student', 403);
	}

	const filter: any = { student: studentId };
	if (req.user!.role === 'teacher') {
		const teacherCourseIds: any[] = await CourseModel.find({
			teacher: req.user!._id,
		}).distinct('_id');
		filter.course = { $in: teacherCourseIds };
	}

	const grades = await GradeModel.find(filter).select(
		'score maxScore percentage letterGrade course'
	);
	if (grades.length === 0) {
		return res.json({ gpa: 0, totalGrades: 0, averagePercentage: 0 });
	}

	const letterToGpa: Record<string, number> = {
		A: 4.0,
		'A-': 3.7,
		'B+': 3.3,
		B: 3.0,
		'B-': 2.7,
		'C+': 2.3,
		C: 2.0,
		'C-': 1.7,
		'D+': 1.3,
		D: 1.0,
		'D-': 0.7,
		F: 0.0,
	};

	let totalWeight = 0;
	let weightedGpaSum = 0;
	let percentageSum = 0;
	for (const g of grades) {
		const weight = Number(g.maxScore) || 1;
		totalWeight += weight;
		const numeric = letterToGpa[g.letterGrade] ?? 0;
		weightedGpaSum += numeric * weight;
		percentageSum += g.percentage;
	}

	const gpa = weightedGpaSum / totalWeight;
	const averagePercentage = percentageSum / grades.length;
	return res.json({
		gpa: Number(gpa.toFixed(2)),
		averagePercentage: Number(averagePercentage.toFixed(2)),
		totalGrades: grades.length,
	});
}

export async function getCourseGrades(req: Request, res: Response) {
	const { courseId } = req.params as any;
	const course = await CourseModel.findById(courseId);
	if (!course) throw createError('Course not found', 404);

	if (req.user!.role === 'teacher') {
		if (course.teacher.toString() !== req.user!._id.toString()) {
			throw createError('Not authorized to view grades for this course', 403);
		}
	}

	const filter: any = { course: courseId };
	if (req.user!.role === 'student') {
		// Students can only see their own grades for the course
		filter.student = req.user!._id;
	}

	const grades = await GradeModel.find(filter)
		.populate('student', 'fullName email')
		.populate('course', 'title code')
		.populate('gradedBy', 'fullName')
		.sort({ createdAt: -1 });

	return res.json(grades);
}
