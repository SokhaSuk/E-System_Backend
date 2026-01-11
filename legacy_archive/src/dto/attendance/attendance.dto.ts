/**
 * Attendance DTOs
 */

export interface RecordAttendanceDto {
    studentId: string;
    courseId: string;
    date: Date;
    status: 'present' | 'absent' | 'late' | 'permission';
    notes?: string;
}

export interface BulkAttendanceDto {
    courseId: string;
    date: Date;
    attendance: Array<{
        studentId: string;
        status: 'present' | 'absent' | 'late' | 'permission';
        notes?: string;
    }>;
}

export interface UpdateAttendanceDto {
    status: 'present' | 'absent' | 'late' | 'permission';
    notes?: string;
}

export interface AttendanceFilterDto {
    student?: string;
    course?: string;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    status?: string;
}
