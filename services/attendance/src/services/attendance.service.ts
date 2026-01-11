import { Attendance, AttendanceDocument, AttendanceStatus } from '../models/Attendance';
import axios from 'axios';
import { config } from '../config/env';

export interface RecordAttendanceDto {
  student: string;
  course: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string;
}

export interface BulkAttendanceDto {
  course: string;
  date: Date;
  records: Array<{
    student: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
  recordedBy: string;
}

export interface AttendanceFilters {
  student?: string;
  course?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export class AttendanceService {
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
   * Get attendance records with pagination and filters
   */
  async getAttendance(filters: AttendanceFilters) {
    const { student, course, startDate, endDate, status, page = 1, limit = 10 } = filters;
    const query: any = {};

    if (student) {
      query.student = student;
    }

    if (course) {
      query.course = course;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      Attendance.find(query).skip(skip).limit(limit).sort({ date: -1 }),
      Attendance.countDocuments(query),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Record single attendance
   */
  async recordAttendance(data: RecordAttendanceDto): Promise<AttendanceDocument> {
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

    // Verify recorder exists
    const recorderExists = await this.verifyUser(data.recordedBy);
    if (!recorderExists) {
      throw new Error('Recorder not found');
    }

    // Check if attendance already exists for this student, course, and date
    const existingAttendance = await Attendance.findOne({
      student: data.student,
      course: data.course,
      date: data.date,
    });

    if (existingAttendance) {
      throw new Error('Attendance record already exists for this date');
    }

    const attendance = await Attendance.create(data);
    return attendance;
  }

  /**
   * Bulk record attendance
   */
  async bulkRecordAttendance(data: BulkAttendanceDto): Promise<AttendanceDocument[]> {
    // Verify course exists
    const courseExists = await this.verifyCourse(data.course);
    if (!courseExists) {
      throw new Error('Course not found');
    }

    // Verify recorder exists
    const recorderExists = await this.verifyUser(data.recordedBy);
    if (!recorderExists) {
      throw new Error('Recorder not found');
    }

    const attendanceRecords = [];

    for (const record of data.records) {
      try {
        const attendance = await Attendance.create({
          student: record.student,
          course: data.course,
          date: data.date,
          status: record.status,
          notes: record.notes,
          recordedBy: data.recordedBy,
        });
        attendanceRecords.push(attendance);
      } catch (error: any) {
        // Skip duplicate records
        if (error.code !== 11000) {
          throw error;
        }
      }
    }

    return attendanceRecords;
  }

  /**
   * Update attendance record
   */
  async updateAttendance(
    attendanceId: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<AttendanceDocument | null> {
    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      { status, notes },
      { new: true, runValidators: true }
    );

    return attendance;
  }

  /**
   * Get attendance statistics for a course
   */
  async getCourseStatistics(courseId: string, startDate?: Date, endDate?: Date) {
    const query: any = { course: courseId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    const records = await Attendance.find(query);

    const stats = {
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      permission: records.filter((r) => r.status === 'permission').length,
      presentPercentage: 0,
      absentPercentage: 0,
      permissionPercentage: 0,
    };

    if (stats.total > 0) {
      stats.presentPercentage = (stats.present / stats.total) * 100;
      stats.absentPercentage = (stats.absent / stats.total) * 100;
      stats.permissionPercentage = (stats.permission / stats.total) * 100;
    }

    return stats;
  }
}

export const attendanceService = new AttendanceService();
