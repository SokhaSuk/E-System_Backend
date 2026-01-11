import { Exercise, ExerciseDocument } from '../models/Exercise';
import axios from 'axios';
import { config } from '../config/env';

export interface CreateExerciseDto {
  course: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxScore: number;
  attachments?: string[];
  createdBy: string;
}

export interface UpdateExerciseDto {
  title?: string;
  description?: string;
  instructions?: string;
  dueDate?: Date;
  maxScore?: number;
  isActive?: boolean;
}

export interface ExerciseFilters {
  course?: string;
  createdBy?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class ExerciseService {
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
   * Get exercises with pagination and filters
   */
  async getExercises(filters: ExerciseFilters) {
    const { course, createdBy, isActive, page = 1, limit = 10 } = filters;
    const query: any = {};

    if (course) {
      query.course = course;
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const skip = (page - 1) * limit;
    const [exercises, total] = await Promise.all([
      Exercise.find(query).skip(skip).limit(limit).sort({ dueDate: 1 }),
      Exercise.countDocuments(query),
    ]);

    return {
      exercises,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(exerciseId: string): Promise<ExerciseDocument | null> {
    return Exercise.findById(exerciseId);
  }

  /**
   * Create exercise
   */
  async createExercise(data: CreateExerciseDto): Promise<ExerciseDocument> {
    // Verify course exists
    const courseExists = await this.verifyCourse(data.course);
    if (!courseExists) {
      throw new Error('Course not found');
    }

    // Verify creator exists
    const creatorExists = await this.verifyUser(data.createdBy);
    if (!creatorExists) {
      throw new Error('Creator not found');
    }

    const exercise = await Exercise.create(data);
    return exercise;
  }

  /**
   * Update exercise
   */
  async updateExercise(
    exerciseId: string,
    data: UpdateExerciseDto
  ): Promise<ExerciseDocument | null> {
    const exercise = await Exercise.findByIdAndUpdate(exerciseId, data, {
      new: true,
      runValidators: true,
    });

    return exercise;
  }

  /**
   * Delete exercise
   */
  async deleteExercise(exerciseId: string): Promise<boolean> {
    const result = await Exercise.findByIdAndDelete(exerciseId);
    return !!result;
  }
}

export const exerciseService = new ExerciseService();
