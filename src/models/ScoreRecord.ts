/**
 * ScoreRecord domain model (Mongoose).
 *
 * Defines the summary of scores for a student in a course (Attendance, Assignment, Midterm, Final).
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ScoreRecordDocument extends Document {
    _id: Types.ObjectId;
    student: Types.ObjectId;
    course: Types.ObjectId;
    semester: string;
    attendanceScore: number;
    assignmentScore: number;
    midtermScore: number;
    finalScore: number;
    totalScore: number;
    grade: string;
    createdAt: Date;
    updatedAt: Date;
}

const scoreRecordSchema = new Schema<ScoreRecordDocument>(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        semester: { type: String, required: true },
        attendanceScore: { type: Number, default: 0 },
        assignmentScore: { type: Number, default: 0 },
        midtermScore: { type: Number, default: 0 },
        finalScore: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 },
        grade: { type: String, default: 'N/A' },
    },
    { timestamps: true }
);

// Index for efficient queries
scoreRecordSchema.index({ student: 1, course: 1 }, { unique: true });

export const ScoreRecordModel = mongoose.model<ScoreRecordDocument>(
    'ScoreRecord',
    scoreRecordSchema
);
