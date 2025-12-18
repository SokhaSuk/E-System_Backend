import { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import { parsePaginationOptions, buildPaginatedResponse } from '../utils/pagination';
import { HTTP_STATUS } from '../constants/http-status';

/**
 * Send a message to the AI
 */
export async function sendMessage(req: Request, res: Response) {
    const { content } = req.body;

    if (!content) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Content is required' });
    }

    const session = await chatService.sendMessage(req.user!._id.toString(), content);
    return res.json(session);
}

/**
 * Get chat history for the user
 */
export async function getHistory(req: Request, res: Response) {
    const pagination = parsePaginationOptions(req.query);
    const { sessions, total } = await chatService.getHistory(
        req.user!._id.toString(),
        pagination.page,
        pagination.limit
    );

    return res.json(buildPaginatedResponse(sessions, total, pagination));
}

/**
 * Clear all chat history
 */
export async function clearHistory(req: Request, res: Response) {
    const result = await chatService.clearHistory(req.user!._id.toString());
    return res.json(result);
}
