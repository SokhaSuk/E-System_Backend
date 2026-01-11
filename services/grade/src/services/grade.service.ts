import { Grade, GradeDocument, GradeType } from '../models/Grade';
import axios from 'axios';
import { config } from '../config/env';

export interface CreateGradeDto {
  student: string;
  course: string;
  gradeType: GradeType;
  title: string;
  score: number;
  maxScore: number;
  comments?: string;
  submittedAt?: Date;
  gradedBy: string;
}

export interface UpdateGradeDto {
  score?: number;
  maxScore?: number;
  comments?: string;
  submittedAt?: Date;
}

export interface GradeFilters {
  student?: string;
  course?: string;
  gradeType?: GradeType;
  page?: number;
  limit?: number;
}

export class GradeService {
  /**
   * Verify course exists via Course Service
   */
  private async verifyCourse(courseId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${config.courseServiceUrl}/courses/${courseId}`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

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
   * Get grades with pagination and filters
   */
  async getGrades(filters: GradeFilters) {
    const { student, course, gradeType, page = 1, limit = 10 } = filters;
    const query: any = {};

    if (student) {
      query.student = student;
    }

    if (course) {
      query.course = course;
    }

    if (gradeType) {
      query.gradeType = gradeType;
    }

    const skip = (page - 1) * limit;
    const [grades, total] = await Promise.all([
      Grade.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Grade.countDocuments(query),
    ]);

    return {
      grades,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get grade by ID
   */
  async getGradeById(gradeId: string): Promise<GradeDocument | null> {
    return Grade.findById(gradeId);
  }

  /**
   * Create a new grade
   */
  async createGrade(data: CreateGradeDto): Promise<GradeDocument> {
    // Verify course exists
    const courseExists = await this.verifyCourse(data.course);
    if (!courseExists) {
      throw new Error('Course not found');
    }

    // Verify student exists
    const studentExists = await this.verifyUser(data.student);
    if (!studentExists) {
      throw new Error('Student not found');
    }

    // Verify grader exists
    const graderExists = await this.verifyUser(data.gradedBy);
    if (!graderExists) {
      throw new Error('Grader not found');
    }

    const grade = await Grade.create(data);
    return grade;
  }

  /**
   * Update grade
   */
  async updateGrade(
    gradeId: string,
    data: UpdateGradeDto
  ): Promise<GradeDocument | null> {
    const grade = await Grade.findByIdAndUpdate(gradeId, data, {
      new: true,
      runValidators: true,
    });

    return grade;
  }

  /**
   * Delete grade
   */
  async deleteGrade(gradeId: string): Promise<boolean> {
    const result = await Grade.findByIdAndDelete(gradeId);
    return !!result;
  }

  /**
   * Get student grades for a specific course
   */
  async getStudentCourseGrades(studentId: string, courseId: string) {
    const grades = await Grade.find({
      student: studentId,
      course: courseId,
    }).sort({ createdAt: -1 });

    // Calculate overall statistics
    if (grades.length === 0) {
      return {
        grades: [],
        statistics: null,
      };
    }

    const totalPercentage = grades.reduce((sum, grade) => sum + grade.percentage, 0);
    const averagePercentage = totalPercentage / grades.length;

    return {
      grades,
      statistics: {
        totalGrades: grades.length,
        averagePercentage: averagePercentage.toFixed(2),
        averageLetterGrade: this.calculateLetterGrade(averagePercentage),
      },
    };
  }

  /**
   * Calculate letter grade from percentage
   */
  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }
}

export const gradeService = new GradeService();
