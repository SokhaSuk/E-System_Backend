import mongoose, { Document, Schema, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'permission';

export interface AttendanceDocument extends Document {
	_id: Types.ObjectId;
	student: Types.ObjectId;
	course: Types.ObjectId;
	date: Date;
	status: AttendanceStatus;
	notes?: string;
	recordedBy: Types.ObjectId;
	blockchainHash?: string;
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
			enum: ['present', 'absent', 'late', 'permission'],
			required: true,
			default: 'present',
		},
		notes: { type: String, trim: true },
		recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		blockchainHash: { type: String },
	},
	{ timestamps: true }
);

attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });

export const AttendanceModel = mongoose.model<AttendanceDocument>(
	'Attendance',
	attendanceSchema
);

