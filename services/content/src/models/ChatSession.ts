import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface IChatSession {
  userId: Types.ObjectId;
  messages: ChatMessage[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSessionDocument extends IChatSession, Document {
  _id: Types.ObjectId;
}

const chatMessageSchema = new Schema<ChatMessage>({
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new Schema<ChatSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    messages: [chatMessageSchema],
    title: { type: String, trim: true },
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model<ChatSessionDocument>(
  'ChatSession',
  chatSessionSchema
);
