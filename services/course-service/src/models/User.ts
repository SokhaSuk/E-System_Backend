/**
 * User Model (Reference only - for population)
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserDocument extends Document {
	_id: Types.ObjectId;
	fullName: string;
	email: string;
	role: UserRole;
}

const userSchema = new Schema<UserDocument>(
	{
		fullName: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		role: {
			type: String,
			enum: ['admin', 'teacher', 'student'],
			required: true,
		},
	},
	{ timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);

