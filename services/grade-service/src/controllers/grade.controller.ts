/**
 * Grade Controllers
 */
import { Request, Response } from 'express';
import { GradeModel, GradeDocument } from '../models/Grade';
import { blockchainClient } from '../services/blockchain.client';
import { createError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

/** POST /api/v1/grades */
export async function createGrade(req: Request, res: Response) {
	const userId = req.headers['x-user-id'] as string;
	const { student, course, gradeType, title, score, maxScore, comments } = req.body;

	if (!student || !course || !gradeType || !title || !score || !maxScore) {
		throw createError('Missing required fields', 400);
	}

	const grade = await GradeModel.create({
		student: new Types.ObjectId(student),
		course: new Types.ObjectId(course),
		gradeType,
		title,
		score,
		maxScore,
		comments,
		gradedBy: new Types.ObjectId(userId),
	});

	// Store on blockchain for immutability
	try {
		const transactionHash = await blockchainClient.storeRecord({
			recordType: 'grade',
			recordId: grade._id.toString(),
			data: {
				student: grade.student.toString(),
				course: grade.course.toString(),
				gradeType: grade.gradeType,
				title: grade.title,
				score: grade.score,
				maxScore: grade.maxScore,
				percentage: grade.percentage,
				letterGrade: grade.letterGrade,
				gradedBy: grade.gradedBy.toString(),
				createdAt: grade.createdAt,
			},
			metadata: {
				studentId: grade.student,
				courseId: grade.course,
				gradeId: grade._id,
			},
		});

		grade.blockchainHash = transactionHash;
		await grade.save();
	} catch (error) {
		console.error('Failed to store grade on blockchain:', error);
		// Continue even if blockchain storage fails
	}

	res.status(201).json({
		_id: grade._id,
		student: grade.student,
		course: grade.course,
		gradeType: grade.gradeType,
		title: grade.title,
		score: grade.score,
		maxScore: grade.maxScore,
		percentage: grade.percentage,
		letterGrade: grade.letterGrade,
		comments: grade.comments,
		blockchainHash: grade.blockchainHash,
		gradedBy: grade.gradedBy,
		createdAt: grade.createdAt,
	});
}

/** GET /api/v1/grades */
export async function getGrades(req: Request, res: Response) {
	const { student, course, gradeType } = req.query;

	const query: any = {};
	if (student) query.student = new Types.ObjectId(student as string);
	if (course) query.course = new Types.ObjectId(course as string);
	if (gradeType) query.gradeType = gradeType;

	const grades = await GradeModel.find(query)
		.populate('student', 'fullName email')
		.populate('course', 'title code')
		.populate('gradedBy', 'fullName')
		.sort({ createdAt: -1 });

	res.json(grades);
}

/** GET /api/v1/grades/:id */
export async function getGrade(req: Request, res: Response) {
	const { id } = req.params;

	const grade = await GradeModel.findById(id)
		.populate('student', 'fullName email')
		.populate('course', 'title code')
		.populate('gradedBy', 'fullName');

	if (!grade) {
		throw createError('Grade not found', 404);
	}

	// Verify on blockchain
	let verified = false;
	if (grade.blockchainHash) {
		verified = await blockchainClient.verifyRecord(grade._id.toString(), 'grade');
	}

	res.json({
		...grade.toObject(),
		blockchainVerified: verified,
	});
}

/** PUT /api/v1/grades/:id */
export async function updateGrade(req: Request, res: Response) {
	const { id } = req.params;
	const { score, maxScore, comments } = req.body;

	const grade = await GradeModel.findById(id);
	if (!grade) {
		throw createError('Grade not found', 404);
	}

	if (score !== undefined) grade.score = score;
	if (maxScore !== undefined) grade.maxScore = maxScore;
	if (comments !== undefined) grade.comments = comments;

	await grade.save();

	// Update blockchain record
	if (grade.blockchainHash) {
		try {
			await blockchainClient.storeRecord({
				recordType: 'grade',
				recordId: grade._id.toString(),
				data: {
					student: grade.student.toString(),
					course: grade.course.toString(),
					gradeType: grade.gradeType,
					title: grade.title,
					score: grade.score,
					maxScore: grade.maxScore,
					percentage: grade.percentage,
					letterGrade: grade.letterGrade,
					gradedBy: grade.gradedBy.toString(),
					updatedAt: grade.updatedAt,
				},
				metadata: {
					studentId: grade.student,
					courseId: grade.course,
					gradeId: grade._id,
				},
			});
		} catch (error) {
			console.error('Failed to update grade on blockchain:', error);
		}
	}

	res.json(grade);
}

/** DELETE /api/v1/grades/:id */
export async function deleteGrade(req: Request, res: Response) {
	const { id } = req.params;

	const grade = await GradeModel.findByIdAndDelete(id);
	if (!grade) {
		throw createError('Grade not found', 404);
	}

	res.json({ message: 'Grade deleted successfully' });
}

