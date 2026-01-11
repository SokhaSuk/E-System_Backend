import { Course, CourseDocument } from '../models/Course';
import axios from 'axios';
import { config } from '../config/env';

export interface CreateCourseDto {
  title: string;
  description: string;
  code: string;
  credits: number;
  teacher: string;
  semester: 'Semester1' | 'Semester2';
  academicYear: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  credits?: number;
  teacher?: string;
  semester?: 'Semester1' | 'Semester2';
  academicYear?: string;
  isActive?: boolean;
}

export interface CourseFilters {
  teacher?: string;
  student?: string;
  semester?: string;
  academicYear?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class CourseService {
  /**
   * Verify user exists via User Service
   */
  private async verifyUser(userId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${config.userServiceUrl}/users/${userId}`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all courses with pagination and filters
   */
  async getCourses(filters: CourseFilters) {
    const { teacher, student, semester, academicYear, isActive, page = 1, limit = 10 } = filters;
    const query: any = {};

    if (teacher) {
      query.teacher = teacher;
    }

    if (student) {
      query.students = student;
    }

    if (semester) {
      query.semester = semester;
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      Course.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Course.countDocuments(query),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId: string): Promise<CourseDocument | null> {
    return Course.findById(courseId);
  }

  /**
   * Create a new course
   */
  async createCourse(data: CreateCourseDto): Promise<CourseDocument> {
    // Verify teacher exists
    const teacherExists = await this.verifyUser(data.teacher);
    if (!teacherExists) {
      throw new Error('Teacher not found');
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: data.code.toUpperCase() });
    if (existingCourse) {
      throw new Error('Course code already exists');
    }

    const course = await Course.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    return course;
  }

  /**
   * Update course
   */
  async updateCourse(
    courseId: string,
    data: UpdateCourseDto
  ): Promise<CourseDocument | null> {
    // Verify teacher exists if being updated
    if (data.teacher) {
      const teacherExists = await this.verifyUser(data.teacher);
      if (!teacherExists) {
        throw new Error('Teacher not found');
      }
    }

    const course = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
      runValidators: true,
    });

    return course;
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: string): Promise<boolean> {
    const result = await Course.findByIdAndDelete(courseId);
    return !!result;
  }

  /**
   * Enroll student in course
   */
  async enrollStudent(courseId: string, studentId: string): Promise<CourseDocument | null> {
    // Verify student exists
    const studentExists = await this.verifyUser(studentId);
    if (!studentExists) {
      throw new Error('Student not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if student is already enrolled
    if (course.students.includes(studentId as any)) {
      throw new Error('Student is already enrolled in this course');
    }

    course.students.push(studentId as any);
    await course.save();

    return course;
  }

  /**
   * Unenroll student from course
   */
  async unenrollStudent(courseId: string, studentId: string): Promise<CourseDocument | null> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    course.students = course.students.filter(
      (id) => id.toString() !== studentId
    );
    await course.save();

    return course;
  }
}

export const courseService = new CourseService();
