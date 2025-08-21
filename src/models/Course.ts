/**
 * Course domain model (Mongoose).
 *
 * Defines the `Course` schema and TypeScript types for course management.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface CourseDocument extends Document {
	_id: Types.ObjectId;
	title: string;
	description: string;
	code: string;
	credits: number;
	teacher: Types.ObjectId;
	students: Types.ObjectId[];
	semester: string;
	academicYear: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const courseSchema = new Schema<CourseDocument>(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, required: true },
		code: { type: String, required: true, unique: true, uppercase: true },
		credits: { type: Number, required: true, min: 1, max: 6 },
		teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		semester: { type: String, required: true, enum: ['Fall', 'Spring', 'Summer'] },
		academicYear: { type: String, required: true },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

// Index for efficient queries
courseSchema.index({ teacher: 1, isActive: 1 });
courseSchema.index({ students: 1, isActive: 1 });

export const CourseModel = mongoose.model<CourseDocument>('Course', courseSchema);
