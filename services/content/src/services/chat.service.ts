import { ChatSession, ChatSessionDocument, ChatMessage } from '../models/ChatSession';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

export class ChatService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  /**
   * Get all chat sessions for a user
   */
  async getUserSessions(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      ChatSession.find({ userId }).skip(skip).limit(limit).sort({ updatedAt: -1 }),
      ChatSession.countDocuments({ userId }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<ChatSessionDocument | null> {
    return ChatSession.findById(sessionId);
  }

  /**
   * Create new chat session
   */
  async createSession(userId: string, title?: string): Promise<ChatSessionDocument> {
    const session = await ChatSession.create({
      userId,
      title: title || 'New Chat',
      messages: [],
    });

    return session;
  }

  /**
   * Send message and get AI response
   */
  async sendMessage(sessionId: string, userMessage: string): Promise<ChatSessionDocument> {
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    session.messages.push(userMsg);

    // Get AI response if Gemini API is configured
    let aiResponse = 'Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.';

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Build conversation history
        const history = session.messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        aiResponse = response.text();
      } catch (error: any) {
        console.error('Gemini AI error:', error);
        aiResponse = 'Sorry, I encountered an error processing your request.';
      }
    }

    // Add AI response
    const aiMsg: ChatMessage = {
      role: 'model',
      content: aiResponse,
      timestamp: new Date(),
    };
    session.messages.push(aiMsg);

    // Update title if this is the first message
    if (session.messages.length === 2 && session.title === 'New Chat') {
      session.title = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
    }

    await session.save();
    return session;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await ChatSession.findByIdAndDelete(sessionId);
    return !!result;
  }
}

export const chatService = new ChatService();
