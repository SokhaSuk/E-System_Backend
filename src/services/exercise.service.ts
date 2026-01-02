import { exerciseRepository } from '../repositories/exercise.repository';
import { exerciseSubmissionRepository } from '../repositories/exerciseSubmission.repository';
import { createError } from '../middleware/errorHandler';
import {
    CreateExerciseDto,
    UpdateExerciseDto,
    ExerciseResponseDto,
    ExerciseFilterDto,
    SubmitExerciseDto,
    GradeSubmissionDto,
    SubmissionResponseDto,
} from '../dto/exercise/exercise.dto';
import { PaginationOptions } from '../interfaces/pagination.interface';
import { UserDocument } from '../models/User';
import { ExerciseDocument } from '../models/Exercise';
import { ExerciseSubmissionDocument } from '../models/ExerciseSubmission';

/**
 * Exercise service containing business logic
 */
export class ExerciseService {
    /**
     * List exercises with filtering and pagination
     */
    async listExercises(
        filter: ExerciseFilterDto,
        pagination: PaginationOptions,
        currentUser: UserDocument
    ) {
        const dbFilter: any = {};

        // Filter by course
        if (filter.course) {
            dbFilter.course = filter.course;
        }

        // Filter by creator
        if (filter.createdBy) {
            dbFilter.createdBy = filter.createdBy;
        }

        // Filter by active status
        if (filter.isActive !== undefined) {
            dbFilter.isActive = filter.isActive;
        }

        // Search filter
        if (filter.search) {
            dbFilter.$or = [
                { title: { $regex: filter.search, $options: 'i' } },
                { description: { $regex: filter.search, $options: 'i' } },
            ];
        }

        // Students can only see active exercises
        if (currentUser.role === 'student') {
            dbFilter.isActive = true;
        }

        const { exercises, total } = await exerciseRepository.findWithPagination(
            dbFilter,
            pagination
        );

        // Get submission counts for each exercise
        const exercisesWithCounts = await Promise.all(
            exercises.map(async (exercise) => {
                const submissionCount = await exerciseSubmissionRepository.countByExercise(
                    exercise._id.toString()
                );
                return this.toResponseDto(exercise, submissionCount);
            })
        );

        return {
            exercises: exercisesWithCounts,
            total,
        };
    }

    /**
     * Get exercise by ID
     */
    async getExerciseById(
        id: string,
        currentUser: UserDocument
    ): Promise<ExerciseResponseDto> {
        const exercise = await exerciseRepository.findByIdWithDetails(id);
        if (!exercise) {
            throw createError('Exercise not found', 404);
        }

        // Students can only view active exercises
        if (currentUser.role === 'student' && !exercise.isActive) {
            throw createError('Exercise not found', 404);
        }

        const submissionCount = await exerciseSubmissionRepository.countByExercise(
            id
        );

        return this.toResponseDto(exercise, submissionCount);
    }

    /**
     * Create a new exercise
     */
    async createExercise(
        data: CreateExerciseDto,
        currentUser: UserDocument
    ): Promise<ExerciseResponseDto> {
        // Only teachers and admins can create exercises
        if (currentUser.role === 'student') {
            throw createError('Only teachers and admins can create exercises', 403);
        }

        // Validate due date is in the future
        if (new Date(data.dueDate) <= new Date()) {
            throw createError('Due date must be in the future', 400);
        }

        const exercise = await exerciseRepository.create({
            ...data,
            createdBy: currentUser._id,
            attachments: [],
        } as any);

        const populated = await exerciseRepository.findByIdWithDetails(
            exercise._id.toString()
        );

        return this.toResponseDto(populated!);
    }

    /**
     * Update exercise
     */
    async updateExercise(
        id: string,
        data: UpdateExerciseDto,
        currentUser: UserDocument
    ): Promise<ExerciseResponseDto> {
        const exercise = await exerciseRepository.findById(id);
        if (!exercise) {
            throw createError('Exercise not found', 404);
        }

        // Only creator or admin can update
        if (
            currentUser.role !== 'admin' &&
            exercise.createdBy.toString() !== currentUser._id.toString()
        ) {
            throw createError('Not authorized to update this exercise', 403);
        }

        // Validate due date if provided
        if (data.dueDate && new Date(data.dueDate) <= new Date()) {
            throw createError('Due date must be in the future', 400);
        }

        const updated = await exerciseRepository.update(id, data);
        if (!updated) {
            throw createError('Failed to update exercise', 500);
        }

        const populated = await exerciseRepository.findByIdWithDetails(id);
        const submissionCount = await exerciseSubmissionRepository.countByExercise(
            id
        );

        return this.toResponseDto(populated!, submissionCount);
    }

    /**
     * Delete exercise
     */
    async deleteExercise(
        id: string,
        currentUser: UserDocument
    ): Promise<{ message: string }> {
        const exercise = await exerciseRepository.findById(id);
        if (!exercise) {
            throw createError('Exercise not found', 404);
        }

        // Only creator or admin can delete
        if (
            currentUser.role !== 'admin' &&
            exercise.createdBy.toString() !== currentUser._id.toString()
        ) {
            throw createError('Not authorized to delete this exercise', 403);
        }

        await exerciseRepository.delete(id);

        return { message: 'Exercise deleted successfully' };
    }

    /**
     * Add attachment to exercise
     */
    async addAttachment(
        id: string,
        file: Express.Multer.File,
        currentUser: UserDocument
    ): Promise<ExerciseResponseDto> {
        const exercise = await exerciseRepository.findById(id);
        if (!exercise) {
            throw createError('Exercise not found', 404);
        }

        // Only creator or admin can add attachments
        if (
            currentUser.role !== 'admin' &&
            exercise.createdBy.toString() !== currentUser._id.toString()
        ) {
            throw createError('Not authorized to update this exercise', 403);
        }

        const fileUrl = `/uploads/exercises/${file.filename}`;
        exercise.attachments.push(fileUrl);
        await exercise.save();

        const populated = await exerciseRepository.findByIdWithDetails(id);
        const submissionCount = await exerciseSubmissionRepository.countByExercise(
            id
        );

        return this.toResponseDto(populated!, submissionCount);
    }

    /**
     * Submit exercise
     */
    async submitExercise(
        exerciseId: string,
        data: SubmitExerciseDto,
        files: Express.Multer.File[],
        currentUser: UserDocument
    ): Promise<SubmissionResponseDto> {
        // Only students can submit
        if (currentUser.role !== 'student') {
            throw createError('Only students can submit exercises', 403);
        }

        const exercise = await exerciseRepository.findById(exerciseId);
        if (!exercise) {
            throw createError('Exercise not found', 404);
        }

        if (!exercise.isActive) {
            throw createError('This exercise is no longer accepting submissions', 400);
        }

        // Check if already submitted
        const existing = await exerciseSubmissionRepository.findByExerciseAndStudent(
            exerciseId,
            currentUser._id.toString()
        );

        if (existing) {
            throw createError('You have already submitted this exercise', 400);
        }

        // Require at least text or files
        if (!data.submittedText && (!files || files.length === 0)) {
            throw createError(
                'Please provide either text submission or upload files',
                400
            );
        }

        // Check if late
        const now = new Date();
        const isLate = now > exercise.dueDate;

        const submittedFiles = files
            ? files.map((file) => `/uploads/submissions/${file.filename}`)
            : [];

        const submission = await exerciseSubmissionRepository.create({
            exercise: exerciseId,
            student: currentUser._id,
            course: exercise.course,
            submittedText: data.submittedText,
            submittedFiles,
            status: isLate ? 'late' : 'pending',
            submittedAt: now,
        } as any);

        const populated = await exerciseSubmissionRepository.findByIdWithDetails(
            submission._id.toString()
        );

        return this.toSubmissionResponseDto(populated!);
    }

    /**
     * Grade submission
     */
    async gradeSubmission(
        exerciseId: string,
        submissionId: string,
        data: GradeSubmissionDto,
        currentUser: UserDocument
    ): Promise<SubmissionResponseDto> {
        // Only teachers and admins can grade
        if (currentUser.role === 'student') {
            throw createError('Only teachers and admins can grade submissions', 403);
        }

        const exercise = await exerciseRepository.findById(exerciseId);
        if (!exercise) {
            throw createError('Exercise not found', 404);
        }

        const submission = await exerciseSubmissionRepository.findById(submissionId);
        if (!submission) {
            throw createError('Submission not found', 404);
        }

        if (submission.exercise.toString() !== exerciseId) {
            throw createError('Submission does not belong to this exercise', 400);
        }

        // Validate score
        if (data.score < 0 || data.score > exercise.maxScore) {
            throw createError(
                `Score must be between 0 and ${exercise.maxScore}`,
                400
            );
        }

        const updated = await exerciseSubmissionRepository.update(submissionId, {
            score: data.score,
            feedback: data.feedback,
            status: 'graded',
            gradedAt: new Date(),
            gradedBy: currentUser._id,
        });

        const populated = await exerciseSubmissionRepository.findByIdWithDetails(
            submissionId
        );

        return this.toSubmissionResponseDto(populated!);
    }

    /**
     * Get submissions for an exercise
     */
    async getSubmissions(
        exerciseId: string,
        currentUser: UserDocument
    ): Promise<SubmissionResponseDto[]> {
        // Only teachers and admins can view all submissions
        if (currentUser.role === 'student') {
            throw createError(
                'Only teachers and admins can view all submissions',
                403
            );
        }

        const exercise = await exerciseRepository.findById(exerciseId);
        if (!exercise) {
            throw createError('Exercise not found', 404);
        }

        const submissions = await exerciseSubmissionRepository.findByExercise(
            exerciseId
        );

        return submissions.map((sub) => this.toSubmissionResponseDto(sub));
    }

    /**
     * Get student's own submission
     */
    async getMySubmission(
        exerciseId: string,
        currentUser: UserDocument
    ): Promise<SubmissionResponseDto | null> {
        const exercise = await exerciseRepository.findById(exerciseId);
        if (!exercise) {
            throw createError('Exercise not found', 404);
        }

        const submission = await exerciseSubmissionRepository.findByExerciseAndStudent(
            exerciseId,
            currentUser._id.toString()
        );

        return submission ? this.toSubmissionResponseDto(submission) : null;
    }

    /**
     * Convert Exercise model to response DTO
     */
    private toResponseDto(
        exercise: ExerciseDocument,
        submissionCount?: number
    ): ExerciseResponseDto {
        return {
            _id: exercise._id.toString(),
            course: {
                _id: (exercise.course as any)._id.toString(),
                title: (exercise.course as any).title,
                code: (exercise.course as any).code,
            },
            title: exercise.title,
            description: exercise.description,
            instructions: exercise.instructions,
            dueDate: exercise.dueDate,
            maxScore: exercise.maxScore,
            attachments: exercise.attachments,
            createdBy: {
                _id: (exercise.createdBy as any)._id.toString(),
                fullName: (exercise.createdBy as any).fullName,
            },
            isActive: exercise.isActive,
            submissionCount,
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
        };
    }

    /**
     * Convert Submission model to response DTO
     */
    private toSubmissionResponseDto(
        submission: ExerciseSubmissionDocument
    ): SubmissionResponseDto {
        return {
            _id: submission._id.toString(),
            exercise: {
                _id: (submission.exercise as any)._id.toString(),
                title: (submission.exercise as any).title,
                dueDate: (submission.exercise as any).dueDate,
                maxScore: (submission.exercise as any).maxScore,
            },
            student: {
                _id: (submission.student as any)._id.toString(),
                fullName: (submission.student as any).fullName,
                studentId: (submission.student as any).studentId,
            },
            course: {
                _id: (submission.course as any)._id.toString(),
                title: (submission.course as any).title,
                code: (submission.course as any).code,
            },
            submittedFiles: submission.submittedFiles,
            submittedText: submission.submittedText,
            score: submission.score,
            feedback: submission.feedback,
            status: submission.status,
            submittedAt: submission.submittedAt,
            gradedAt: submission.gradedAt,
            gradedBy: submission.gradedBy
                ? {
                    _id: (submission.gradedBy as any)._id.toString(),
                    fullName: (submission.gradedBy as any).fullName,
                }
                : undefined,
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt,
        };
    }
}

// Export singleton instance
export const exerciseService = new ExerciseService();
