import { Router, Request, Response } from 'express';
import { attendanceService } from '../services/attendance.service';

const router = Router();

/**
 * GET /attendance
 * Get attendance records with pagination and filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { student, course, startDate, endDate, status, page, limit } = req.query;

    const result = await attendanceService.getAttendance({
      student: student as string,
      course: course as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      status: status as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.records,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch attendance records',
    });
  }
});

/**
 * POST /attendance
 * Record single attendance
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const attendance = await attendanceService.recordAttendance(req.body);

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to record attendance',
    });
  }
});

/**
 * POST /attendance/bulk
 * Bulk record attendance
 */
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const records = await attendanceService.bulkRecordAttendance(req.body);

    res.status(201).json({
      success: true,
      data: records,
      message: `Successfully recorded ${records.length} attendance records`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to bulk record attendance',
    });
  }
});

/**
 * PUT /attendance/:id
 * Update attendance record
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const attendance = await attendanceService.updateAttendance(
      req.params.id,
      status,
      notes
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update attendance',
    });
  }
});

/**
 * GET /attendance/stats/:courseId
 * Get attendance statistics for a course
 */
router.get('/stats/:courseId', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await attendanceService.getCourseStatistics(
      req.params.courseId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics',
    });
  }
});

export default router;
