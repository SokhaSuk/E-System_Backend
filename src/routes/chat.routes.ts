import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /chat/send:
 *   post:
 *     summary: Send a message to the AI assistant
 *     tags: [Chat]
 */
router.post(
    '/send',
    validate({
        body: Joi.object({
            content: Joi.string().required().min(1),
        }),
    }),
    asyncHandler(chatController.sendMessage)
);

/**
 * @swagger
 * /chat/history:
 *   get:
 *     summary: Get user's chat history
 *     tags: [Chat]
 */
router.get('/history', asyncHandler(chatController.getHistory));

/**
 * @swagger
 * /chat/clear:
 *   delete:
 *     summary: Clear all chat history for the user
 *     tags: [Chat]
 */
router.delete('/clear', asyncHandler(chatController.clearHistory));

export default router;
