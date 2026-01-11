import { Router, Request, Response } from 'express';
import { announcementService } from '../services/announcement.service';
import { chatService } from '../services/chat.service';
import { exerciseService } from '../services/exercise.service';

const router = Router();

// ==================== ANNOUNCEMENT ROUTES ====================

/**
 * GET /announcements
 * Get announcements with pagination and filters
 */
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const { type, course, targetAudience, isActive, page, limit } = req.query;

    const result = await announcementService.getAnnouncements({
      type: type as any,
      course: course as string,
      targetAudience: targetAudience as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.announcements,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch announcements',
    });
  }
});

/**
 * GET /announcements/:id
 * Get announcement by ID
 */
router.get('/announcements/:id', async (req: Request, res: Response) => {
  try {
    const announcement = await announcementService.getAnnouncementById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch announcement',
    });
  }
});

/**
 * POST /announcements
 * Create announcement
 */
router.post('/announcements', async (req: Request, res: Response) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body);

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create announcement',
    });
  }
});

/**
 * PUT /announcements/:id
 * Update announcement
 */
router.put('/announcements/:id', async (req: Request, res: Response) => {
  try {
    const announcement = await announcementService.updateAnnouncement(
      req.params.id,
      req.body
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update announcement',
    });
  }
});

/**
 * DELETE /announcements/:id
 * Delete announcement
 */
router.delete('/announcements/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await announcementService.deleteAnnouncement(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete announcement',
    });
  }
});

// ==================== CHAT ROUTES ====================

/**
 * GET /chat/sessions
 * Get user's chat sessions
 */
router.get('/chat/sessions', async (req: Request, res: Response) => {
  try {
    const { userId, page, limit } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const result = await chatService.getUserSessions(
      userId as string,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    res.json({
      success: true,
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch chat sessions',
    });
  }
});

/**
 * GET /chat/sessions/:id
 * Get chat session by ID
 */
router.get('/chat/sessions/:id', async (req: Request, res: Response) => {
  try {
    const session = await chatService.getSessionById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch chat session',
    });
  }
});

/**
 * POST /chat/sessions
 * Create new chat session
 */
router.post('/chat/sessions', async (req: Request, res: Response) => {
  try {
    const { userId, title } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const session = await chatService.createSession(userId, title);

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create chat session',
    });
  }
});

/**
 * POST /chat/sessions/:id/messages
 * Send message to chat session
 */
router.post('/chat/sessions/:id/messages', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const session = await chatService.sendMessage(req.params.id, message);

    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send message',
    });
  }
});

/**
 * DELETE /chat/sessions/:id
 * Delete chat session
 */
router.delete('/chat/sessions/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await chatService.deleteSession(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete chat session',
    });
  }
});

// ==================== EXERCISE ROUTES ====================

/**
 * GET /exercises
 * Get exercises with pagination and filters
 */
router.get('/exercises', async (req: Request, res: Response) => {
  try {
    const { course, createdBy, isActive, page, limit } = req.query;

    const result = await exerciseService.getExercises({
      course: course as string,
      createdBy: createdBy as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: result.exercises,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch exercises',
    });
  }
});

/**
 * GET /exercises/:id
 * Get exercise by ID
 */
router.get('/exercises/:id', async (req: Request, res: Response) => {
  try {
    const exercise = await exerciseService.getExerciseById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    res.json({
      success: true,
      data: exercise,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch exercise',
    });
  }
});

/**
 * POST /exercises
 * Create exercise
 */
router.post('/exercises', async (req: Request, res: Response) => {
  try {
    const exercise = await exerciseService.createExercise(req.body);

    res.status(201).json({
      success: true,
      data: exercise,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create exercise',
    });
  }
});

/**
 * PUT /exercises/:id
 * Update exercise
 */
router.put('/exercises/:id', async (req: Request, res: Response) => {
  try {
    const exercise = await exerciseService.updateExercise(req.params.id, req.body);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    res.json({
      success: true,
      data: exercise,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update exercise',
    });
  }
});

/**
 * DELETE /exercises/:id
 * Delete exercise
 */
router.delete('/exercises/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await exerciseService.deleteExercise(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    res.json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete exercise',
    });
  }
});

export default router;
