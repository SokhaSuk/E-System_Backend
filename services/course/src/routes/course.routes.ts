import { Router, Request, Response } from 'express';
import { courseService } from '../services/course.service';

const router = Router();

/**
 * GET /courses
 * Get all courses with pagination and filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { teacher, student, semester, academicYear, isActive, page, limit } = req.query;

    const result = await courseService.getCourses({
      teacher: teacher as string,
      student: student as string,
      semester: semester as string,
      academicYear: academicYear as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.courses,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch courses',
    });
  }
});

/**
 * GET /courses/:id
 * Get course by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await courseService.getCourseById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch course',
    });
  }
});

/**
 * POST /courses
 * Create a new course
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const course = await courseService.createCourse(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create course',
    });
  }
});

/**
 * PUT /courses/:id
 * Update course
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update course',
    });
  }
});

/**
 * DELETE /courses/:id
 * Delete course
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await courseService.deleteCourse(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete course',
    });
  }
});

/**
 * POST /courses/:id/enroll
 * Enroll student in course
 */
router.post('/:id/enroll', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required',
      });
    }

    const course = await courseService.enrollStudent(req.params.id, studentId);

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to enroll student',
    });
  }
});

/**
 * DELETE /courses/:id/students/:studentId
 * Unenroll student from course
 */
router.delete('/:id/students/:studentId', async (req: Request, res: Response) => {
  try {
    const course = await courseService.unenrollStudent(
      req.params.id,
      req.params.studentId
    );

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to unenroll student',
    });
  }
});

export default router;
