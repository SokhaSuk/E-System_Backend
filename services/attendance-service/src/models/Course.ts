import mongoose, { Document, Schema, Types } from 'mongoose';

export interface CourseDocument extends Document {
	_id: Types.ObjectId;
	title: string;
	code: string;
	teacher: Types.ObjectId;
	students: Types.ObjectId[];
}

const courseSchema = new Schema<CourseDocument>(
	{
		title: { type: String, required: true },
		code: { type: String, required: true },
		teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	},
	{ timestamps: true }
);

export const CourseModel = mongoose.model<CourseDocument>('Course', courseSchema);

