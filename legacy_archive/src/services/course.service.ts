import { courseRepository } from '../repositories/course.repository';
import { userRepository } from '../repositories/user.repository';
import { createError } from '../middleware/errorHandler';
import {
    CreateCourseDto,
    UpdateCourseDto,
    CourseFilterDto,
    CourseResponseDto,
} from '../dto/course/course.dto';
import { PaginationOptions } from '../interfaces/pagination.interface';
import { CourseDocument } from '../models/Course';
import { UserDocument } from '../models/User';

/**
 * Course service containing business logic
 */
export class CourseService {
    /**
     * List courses with filters and pagination
     */
    async listCourses(filter: CourseFilterDto, pagination: PaginationOptions) {
        const dbFilter: any = {};

        if (filter.teacher) dbFilter.teacher = filter.teacher;
        if (filter.semester) dbFilter.semester = filter.semester;
        if (filter.academicYear) dbFilter.academicYear = filter.academicYear;
        if (filter.isActive !== undefined) dbFilter.isActive = filter.isActive;

        if (filter.search) {
            dbFilter.$or = [
                { title: { $regex: filter.search, $options: 'i' } },
                { description: { $regex: filter.search, $options: 'i' } },
                { code: { $regex: filter.search, $options: 'i' } },
            ];
        }

        const { courses, total } = await courseRepository.findWithPagination(
            dbFilter,
            pagination
        );

        return {
            courses: courses.map(course => this.toResponseDto(course)),
            total,
        };
    }

    /**
     * Get course by ID
     */
    async getCourseById(id: string): Promise<CourseResponseDto> {
        const course = await courseRepository.findByIdWithPopulation(id);
        if (!course) {
            throw createError('Course not found', 404);
        }
        return this.toResponseDto(course);
    }

    /**
     * Create a new course
     */
    async createCourse(
        data: CreateCourseDto,
        teacherId: string
    ): Promise<CourseResponseDto> {
        // Check if course code already exists
        const existingCourse = await courseRepository.findByCode(data.code);
        if (existingCourse) {
            throw createError('Course code already exists', 409);
        }

        // Create course
        const course = await courseRepository.create({
            ...data,
            teacher: teacherId,
        } as any);

        // Populate teacher
        const populatedCourse = await courseRepository.findByIdWithPopulation(
            course._id.toString()
        );

        return this.toResponseDto(populatedCourse!);
    }

    /**
     * Update course
     */
    async updateCourse(
        id: string,
        data: UpdateCourseDto,
        currentUser: UserDocument
    ): Promise<CourseResponseDto> {
        const course = await courseRepository.findById(id);
        if (!course) {
            throw createError('Course not found', 404);
        }

        // Only the course teacher or admin can update
        if (
            currentUser.role !== 'admin' &&
            course.teacher.toString() !== currentUser._id.toString()
        ) {
            throw createError('Not authorized to update this course', 403);
        }

        // Update course
        const updatedCourse = await courseRepository.update(id, data as any);
        if (!updatedCourse) {
            throw createError('Failed to update course', 500);
        }

        // Get with population
        const populatedCourse = await courseRepository.findByIdWithPopulation(id);
        return this.toResponseDto(populatedCourse!);
    }

    /**
     * Enroll student in course
     */
    async enrollStudent(
        courseId: string,
        studentId: string,
        currentUser: UserDocument
    ): Promise<CourseResponseDto> {
        const course = await courseRepository.findById(courseId);
        if (!course) {
            throw createError('Course not found', 404);
        }

        // Check authorization
        if (
            currentUser.role !== 'admin' &&
            course.teacher.toString() !== currentUser._id.toString()
        ) {
            throw createError(
                'Not authorized to enroll students in this course',
                403
            );
        }

        // Verify student exists and has student role
        const student = await userRepository.findById(studentId);
        if (!student || student.role !== 'student') {
            throw createError('Invalid student ID', 400);
        }

        // Check if already enrolled
        if (course.students.map(id => id.toString()).includes(studentId)) {
            throw createError('Student is already enrolled in this course', 409);
        }

        // Enroll student
        const updatedCourse = await courseRepository.addStudent(courseId, studentId);
        return this.toResponseDto(updatedCourse!);
    }

    /**
     * Remove student from course
     */
    async removeStudent(
        courseId: string,
        studentId: string,
        currentUser: UserDocument
    ): Promise<CourseResponseDto> {
        const course = await courseRepository.findById(courseId);
        if (!course) {
            throw createError('Course not found', 404);
        }

        // Check authorization
        if (
            currentUser.role !== 'admin' &&
            course.teacher.toString() !== currentUser._id.toString()
        ) {
            throw createError(
                'Not authorized to remove students from this course',
                403
            );
        }

        // Remove student
        const updatedCourse = await courseRepository.removeStudent(
            courseId,
            studentId
        );
        return this.toResponseDto(updatedCourse!);
    }

    /**
     * Delete course (admin only)
     */
    async deleteCourse(
        id: string,
        currentUser: UserDocument
    ): Promise<{ message: string }> {
        if (currentUser.role !== 'admin') {
            throw createError('Only administrators can delete courses', 403);
        }

        const course = await courseRepository.delete(id);
        if (!course) {
            throw createError('Course not found', 404);
        }

        return { message: 'Course deleted successfully' };
    }

    /**
     * Convert Course model to response DTO
     */
    private toResponseDto(course: CourseDocument): CourseResponseDto {
        return {
            _id: course._id.toString(),
            title: course.title,
            description: course.description,
            code: course.code,
            credits: course.credits,
            semester: course.semester,
            academicYear: course.academicYear,
            teacher: course.teacher,
            students: course.students,
            isActive: course.isActive,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
        };
    }
}

// Export singleton instance
export const courseService = new CourseService();


