import { Router, Request, Response } from 'express';
import { gradeService } from '../services/grade.service';

const router = Router();

/**
 * GET /grades
 * Get grades with pagination and filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { student, course, gradeType, page, limit } = req.query;

    const result = await gradeService.getGrades({
      student: student as string,
      course: course as string,
      gradeType: gradeType as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.grades,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch grades',
    });
  }
});

/**
 * GET /grades/:id
 * Get grade by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const grade = await gradeService.getGradeById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found',
      });
    }

    res.json({
      success: true,
      data: grade,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch grade',
    });
  }
});

/**
 * POST /grades
 * Create a new grade
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const grade = await gradeService.createGrade(req.body);

    res.status(201).json({
      success: true,
      data: grade,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create grade',
    });
  }
});

/**
 * PUT /grades/:id
 * Update grade
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const grade = await gradeService.updateGrade(req.params.id, req.body);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found',
      });
    }

    res.json({
      success: true,
      data: grade,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update grade',
    });
  }
});

/**
 * DELETE /grades/:id
 * Delete grade
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await gradeService.deleteGrade(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found',
      });
    }

    res.json({
      success: true,
      message: 'Grade deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete grade',
    });
  }
});

/**
 * GET /grades/student/:studentId/course/:courseId
 * Get student's grades for a specific course
 */
router.get('/student/:studentId/course/:courseId', async (req: Request, res: Response) => {
  try {
    const result = await gradeService.getStudentCourseGrades(
      req.params.studentId,
      req.params.courseId
    );

    res.json({
      success: true,
      data: result.grades,
      statistics: result.statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch student grades',
    });
  }
});

export default router;
