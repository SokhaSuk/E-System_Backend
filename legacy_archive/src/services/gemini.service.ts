import { GoogleGenerativeAI, GenerativeModel, Content } from '@google/generative-ai';
import { env } from '../config/env';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../constants/http-status';
import { ChatMessage } from '../models/Chat';

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: GenerativeModel | null = null;

    constructor() {
        if (env.geminiApiKey) {
            this.genAI = new GoogleGenerativeAI(env.geminiApiKey);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: 'You are a helpful educational assistant for the E-System platform. You help students and teachers with their questions regarding school work, curriculum, and general educational help. Keep your answers concise, accurate, and encouraging.',
            });
        }
    }

    /**
     * Generate a response from Gemini
     * @param history Previous messages in Gemini format
     * @param prompt The user's new message
     */
    async generateResponse(history: ChatMessage[], prompt: string): Promise<string> {
        if (!this.model) {
            throw new AppError('Gemini API key is not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        try {
            // Convert our ChatMessage format to Gemini's Content format
            const geminiHistory: Content[] = history.map((msg) => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));

            const chatSession = this.model.startChat({
                history: geminiHistory,
            });

            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            const detail = error.message || 'Unknown Gemini error';
            throw new AppError(`AI Error: ${detail}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}
