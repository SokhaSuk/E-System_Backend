import { BaseRepository, FilterQuery } from './base.repository';
import {
    ExerciseSubmissionModel,
    ExerciseSubmissionDocument,
} from '../models/ExerciseSubmission';


/**
 * ExerciseSubmission repository for data access operations
 */
export class ExerciseSubmissionRepository extends BaseRepository<ExerciseSubmissionDocument> {
    constructor() {
        super(ExerciseSubmissionModel);
    }

    /**
     * Find submission by exercise and student
     */
    async findByExerciseAndStudent(
        exerciseId: string,
        studentId: string
    ): Promise<ExerciseSubmissionDocument | null> {
        return this.model
            .findOne({ exercise: exerciseId, student: studentId })
            .populate('student', 'fullName email studentId')
            .populate('gradedBy', 'fullName email')
            .exec();
    }

    /**
     * Find all submissions for an exercise
     */
    async findByExercise(
        exerciseId: string
    ): Promise<ExerciseSubmissionDocument[]> {
        return this.model
            .find({ exercise: exerciseId })
            .populate('student', 'fullName email studentId')
            .populate('gradedBy', 'fullName email')
            .sort({ submittedAt: -1 })
            .exec();
    }

    /**
     * Find all submissions by a student
     */
    async findByStudent(
        studentId: string,
        courseId?: string
    ): Promise<ExerciseSubmissionDocument[]> {
        const filter: FilterQuery<ExerciseSubmissionDocument> = {
            student: studentId,
        };
        if (courseId) {
            filter.course = courseId;
        }

        return this.model
            .find(filter)
            .populate('exercise', 'title dueDate maxScore')
            .populate('course', 'title code')
            .populate('gradedBy', 'fullName email')
            .sort({ submittedAt: -1 })
            .exec();
    }

    /**
     * Count submissions for an exercise
     */
    async countByExercise(exerciseId: string): Promise<number> {
        return this.model.countDocuments({ exercise: exerciseId }).exec();
    }

    /**
     * Count submissions by status
     */
    async countByStatus(
        exerciseId: string,
        status: string
    ): Promise<number> {
        return this.model
            .countDocuments({ exercise: exerciseId, status })
            .exec();
    }

    /**
     * Find submission by ID with populated references
     */
    async findByIdWithDetails(
        id: string
    ): Promise<ExerciseSubmissionDocument | null> {
        return this.model
            .findById(id)
            .populate('exercise', 'title dueDate maxScore')
            .populate('student', 'fullName email studentId')
            .populate('course', 'title code')
            .populate('gradedBy', 'fullName email')
            .exec();
    }
}

// Export singleton instance
export const exerciseSubmissionRepository =
    new ExerciseSubmissionRepository();
