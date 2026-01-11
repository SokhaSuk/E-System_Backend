/**
 * Exercise domain model (Mongoose).
 *
 * Defines the Exercise schema and TypeScript types for exercise management.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ExerciseDocument extends Document {
    _id: Types.ObjectId;
    course: Types.ObjectId;
    title: string;
    description: string;
    instructions?: string;
    dueDate: Date;
    maxScore: number;
    attachments: string[];
    createdBy: Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const exerciseSchema = new Schema<ExerciseDocument>(
    {
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        instructions: { type: String, trim: true },
        dueDate: { type: Date, required: true },
        maxScore: { type: Number, required: true, min: 1, max: 100, default: 100 },
        attachments: [{ type: String }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Indexes for efficient queries
exerciseSchema.index({ course: 1, isActive: 1 });
exerciseSchema.index({ createdBy: 1, isActive: 1 });
exerciseSchema.index({ dueDate: 1 });

export const ExerciseModel = mongoose.model<ExerciseDocument>(
    'Exercise',
    exerciseSchema
);
