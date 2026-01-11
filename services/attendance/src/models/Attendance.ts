import mongoose, { Document, Schema, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'permission';

export interface IAttendance {
  student: Types.ObjectId;
  course: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceDocument extends IAttendance, Document {
  _id: Types.ObjectId;
}

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'permission'],
      required: true,
      default: 'present',
    },
    notes: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// Indexes for efficient queries
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ student: 1, date: 1 });

export const Attendance = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema);
