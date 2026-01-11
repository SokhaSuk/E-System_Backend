/**
 * Exercise DTOs for request/response handling
 */
import { SubmissionStatus } from '../../models/ExerciseSubmission';

/**
 * DTO for creating a new exercise
 */
export interface CreateExerciseDto {
    course: string;
    title: string;
    description: string;
    instructions?: string;
    dueDate: Date;
    maxScore?: number;
}

/**
 * DTO for updating exercise information
 */
export interface UpdateExerciseDto {
    title?: string;
    description?: string;
    instructions?: string;
    dueDate?: Date;
    maxScore?: number;
    isActive?: boolean;
}

/**
 * Exercise response DTO
 */
export interface ExerciseResponseDto {
    _id: string;
    course: {
        _id: string;
        title: string;
        code: string;
    };
    title: string;
    description: string;
    instructions?: string;
    dueDate: Date;
    maxScore: number;
    attachments: string[];
    createdBy: {
        _id: string;
        fullName: string;
    };
    isActive: boolean;
    submissionCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Exercise list filter options
 */
export interface ExerciseFilterDto {
    course?: string;
    createdBy?: string;
    isActive?: boolean;
    search?: string;
}

/**
 * DTO for submitting an exercise
 */
export interface SubmitExerciseDto {
    submittedText?: string;
}

/**
 * DTO for grading a submission
 */
export interface GradeSubmissionDto {
    score: number;
    feedback?: string;
}

/**
 * Submission response DTO
 */
export interface SubmissionResponseDto {
    _id: string;
    exercise: {
        _id: string;
        title: string;
        dueDate: Date;
        maxScore: number;
    };
    student: {
        _id: string;
        fullName: string;
        studentId?: string;
    };
    course: {
        _id: string;
        title: string;
        code: string;
    };
    submittedFiles: string[];
    submittedText?: string;
    score?: number;
    feedback?: string;
    status: SubmissionStatus;
    submittedAt: Date;
    gradedAt?: Date;
    gradedBy?: {
        _id: string;
        fullName: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
