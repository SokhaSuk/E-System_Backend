/**
 * Attendance domain model (Mongoose).
 *
 * Defines the `Attendance` schema and TypeScript types for attendance tracking.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceDocument extends Document {
	_id: Types.ObjectId;
	student: Types.ObjectId;
	course: Types.ObjectId;
	date: Date;
	status: AttendanceStatus;
	notes?: string;
	recordedBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const attendanceSchema = new Schema<AttendanceDocument>(
	{
		student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
		date: { type: Date, required: true },
		status: { 
			type: String, 
			enum: ['present', 'absent', 'late', 'excused'], 
			required: true,
			default: 'present'
		},
		notes: { type: String, trim: true },
		recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
	},
	{ timestamps: true }
);

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// Index for efficient queries
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });

export const AttendanceModel = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema);
