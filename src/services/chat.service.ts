import { ChatRepository } from '../repositories/chat.repository';
import { GeminiService } from './gemini.service';
import { ChatMessage, ChatSessionDocument } from '../models/Chat';
import { createError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

export class ChatService {
    private chatRepository: ChatRepository;
    private geminiService: GeminiService;

    constructor() {
        this.chatRepository = new ChatRepository();
        this.geminiService = new GeminiService();
    }

    /**
     * Send a message to the AI and get a response
     */
    async sendMessage(userId: string, content: string): Promise<ChatSessionDocument> {
        // 1. Find or create a session (using the most recent one for simplicity)
        let session = await this.chatRepository.findRecentSession(userId);

        if (!session) {
            session = await this.chatRepository.create({
                userId: new Types.ObjectId(userId) as any,
                messages: [],
                title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
            });
        }

        // 2. Prepare context (previous messages)
        const history = session.messages;

        // 3. Get AI response
        const aiContent = await this.geminiService.generateResponse(history, content);

        // 4. Save user message
        await this.chatRepository.addMessage(session._id.toString(), {
            role: 'user',
            content,
            timestamp: new Date(),
        });

        // 5. Save AI message
        const updatedSession = await this.chatRepository.addMessage(session._id.toString(), {
            role: 'model',
            content: aiContent,
            timestamp: new Date(),
        });

        if (!updatedSession) {
            throw createError('Failed to update chat session', 500);
        }

        return updatedSession;
    }

    /**
     * Get history of chat sessions for a user
     */
    async getHistory(userId: string, page: number = 1, limit: number = 10) {
        const sessions = await this.chatRepository.findUserSessions(userId, page, limit);
        const total = await this.chatRepository.count({ userId: new Types.ObjectId(userId) });
        return { sessions, total };
    }

    /**
     * Clear all chat history for a user
     */
    async clearHistory(userId: string) {
        await this.chatRepository.deleteSessionsByUserId(userId);
        return { message: 'Chat history cleared successfully' };
    }
}

export const chatService = new ChatService();
