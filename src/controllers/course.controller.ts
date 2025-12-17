/**
 * Course controllers.
 * Controllers are thin HTTP handlers that delegate to the service layer.
 */
import { Request, Response } from 'express';
import { courseService } from '../services/course.service';
import {
	CreateCourseDto,
	UpdateCourseDto,
	CourseFilterDto,
} from '../dto/course/course.dto';
import {
	parsePaginationOptions,
	buildPaginatedResponse,
} from '../utils/pagination';

export async function listCourses(req: Request, res: Response) {
	const filter: CourseFilterDto = {
		teacher: req.query.teacher as string,
		semester: req.query.semester as any,
		academicYear: req.query.academicYear as string,
		isActive: req.query.isActive as any,
		search: req.query.search as string,
	};

	const pagination = parsePaginationOptions(req.query);

	const { courses, total } = await courseService.listCourses(filter, pagination);

	return res.json(buildPaginatedResponse(courses, total, pagination));
}

export async function getCourse(req: Request, res: Response) {
	const course = await courseService.getCourseById(req.params.id);
	return res.json(course);
}

export async function createCourse(req: Request, res: Response) {
	const dto: CreateCourseDto = req.body;
	const course = await courseService.createCourse(dto, req.user!._id.toString());
	return res.status(201).json(course);
}

export async function updateCourse(req: Request, res: Response) {
	const dto: UpdateCourseDto = req.body;
	const course = await courseService.updateCourse(
		req.params.id,
		dto,
		req.user!
	);
	return res.json(course);
}

export async function enrollStudent(req: Request, res: Response) {
	const { studentId } = req.body;
	const course = await courseService.enrollStudent(
		req.params.id,
		studentId,
		req.user!
	);
	return res.json(course);
}

export async function removeStudent(req: Request, res: Response) {
	const course = await courseService.removeStudent(
		req.params.id,
		req.params.studentId,
		req.user!
	);
	return res.json(course);
}

export async function deleteCourse(req: Request, res: Response) {
	const result = await courseService.deleteCourse(req.params.id, req.user!);
	return res.json(result);
}
