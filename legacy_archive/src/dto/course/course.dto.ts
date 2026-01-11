/**
 * Course DTOs
 */

export interface CreateCourseDto {
    title: string;
    description: string;
    code: string;
    credits: number;
    semester: 'Semester1' | 'Semester2';
    academicYear: string;
}

export interface UpdateCourseDto {
    title?: string;
    description?: string;
    code?: string;
    credits?: number;
    semester?: 'Semester1' | 'Semester2';
    academicYear?: string;
    isActive?: boolean;
}

export interface CourseFilterDto {
    teacher?: string;
    semester?: 'Semester1' | 'Semester2';
    academicYear?: string;
    isActive?: boolean;
    search?: string;
}

export interface EnrollStudentDto {
    studentId: string;
}

export interface CourseResponseDto {
    _id: string;
    title: string;
    description: string;
    code: string;
    credits: number;
    semester: string;
    academicYear: string;
    teacher: any;
    students: any[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
