import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface IUser {
  fullName: string;
  email: string;
  role: UserRole;
  nameKh?: string;
  gender?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  phone?: string;
  occupation?: string;
  address?: string;
  studyShift?: string;
  avatar?: string;
  nationality?: string;
  studentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      required: true,
      default: 'student',
    },
    nameKh: { type: String, trim: true },
    gender: { type: String, trim: true },
    dateOfBirth: { type: Date },
    placeOfBirth: { type: String, trim: true },
    phone: { type: String, trim: true },
    occupation: { type: String, trim: true },
    address: { type: String, trim: true },
    studyShift: { type: String, trim: true },
    avatar: { type: String, trim: true },
    nationality: { type: String, trim: true },
    studentId: { type: String, trim: true, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', userSchema);
