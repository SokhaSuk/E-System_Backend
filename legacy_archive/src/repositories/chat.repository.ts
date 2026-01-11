import { BaseRepository } from './base.repository';
import { ChatSessionDocument, ChatSessionModel, ChatMessage } from '../models/Chat';
import { Types } from 'mongoose';

export class ChatRepository extends BaseRepository<ChatSessionDocument> {
    constructor() {
        super(ChatSessionModel);
    }

    /**
     * Find the most recent session for a user
     */
    async findRecentSession(userId: string): Promise<ChatSessionDocument | null> {
        return this.model
            .findOne({ userId: new Types.ObjectId(userId) })
            .sort({ updatedAt: -1 })
            .exec();
    }

    /**
     * Add a message to a session
     */
    async addMessage(sessionId: string, message: ChatMessage): Promise<ChatSessionDocument | null> {
        return this.model
            .findByIdAndUpdate(
                sessionId,
                {
                    $push: { messages: message },
                    $set: { updatedAt: new Date() },
                },
                { new: true }
            )
            .exec();
    }

    /**
     * Get all sessions for a user with pagination
     */
    async findUserSessions(userId: string, page: number = 1, limit: number = 10): Promise<ChatSessionDocument[]> {
        return this.findAll({ userId: new Types.ObjectId(userId) }, { page, limit });
    }

    /**
     * Delete all sessions for a user
     */
    async deleteSessionsByUserId(userId: string): Promise<void> {
        await this.model.deleteMany({ userId: new Types.ObjectId(userId) }).exec();
    }
}
