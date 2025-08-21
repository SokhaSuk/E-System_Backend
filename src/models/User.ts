import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserDocument extends Document {
	_id: Types.ObjectId;
	fullName: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
	{
		fullName: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['admin', 'teacher', 'student'], required: true, default: 'student' },
	},
	{ timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);


