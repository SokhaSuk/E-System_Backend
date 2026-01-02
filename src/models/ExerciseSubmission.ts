/**
 * ExerciseSubmission domain model (Mongoose).
 *
 * Defines the ExerciseSubmission schema and TypeScript types for student submissions.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type SubmissionStatus = 'pending' | 'graded' | 'late';

export interface ExerciseSubmissionDocument extends Document {
    _id: Types.ObjectId;
    exercise: Types.ObjectId;
    student: Types.ObjectId;
    course: Types.ObjectId;
    submittedFiles: string[];
    submittedText?: string;
    score?: number;
    feedback?: string;
    status: SubmissionStatus;
    submittedAt: Date;
    gradedAt?: Date;
    gradedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const exerciseSubmissionSchema = new Schema<ExerciseSubmissionDocument>(
    {
        exercise: {
            type: Schema.Types.ObjectId,
            ref: 'Exercise',
            required: true,
        },
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        submittedFiles: [{ type: String }],
        submittedText: { type: String, trim: true },
        score: { type: Number, min: 0 },
        feedback: { type: String, trim: true },
        status: {
            type: String,
            enum: ['pending', 'graded', 'late'],
            default: 'pending',
        },
        submittedAt: { type: Date, default: Date.now },
        gradedAt: { type: Date },
        gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Indexes for efficient queries
exerciseSubmissionSchema.index({ exercise: 1, student: 1 }, { unique: true });
exerciseSubmissionSchema.index({ student: 1, course: 1 });
exerciseSubmissionSchema.index({ exercise: 1, status: 1 });
exerciseSubmissionSchema.index({ course: 1, status: 1 });

export const ExerciseSubmissionModel =
    mongoose.model<ExerciseSubmissionDocument>(
        'ExerciseSubmission',
        exerciseSubmissionSchema
    );
