/**
 * Grade DTOs
 */

export interface CreateGradeDto {
    studentId: string;
    courseId: string;
    gradeType: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation' | 'final';
    title: string;
    score: number;
    maxScore: number;
    comments?: string;
    submittedAt?: Date;
}

export interface UpdateGradeDto {
    title?: string;
    score?: number;
    maxScore?: number;
    comments?: string;
    gradeType?: 'assignment' | 'quiz' | 'exam' | 'project' | 'participation' | 'final';
    submittedAt?: Date;
}

export interface GradeFilterDto {
    student?: string;
    course?: string;
    gradeType?: string;
    search?: string;
}
