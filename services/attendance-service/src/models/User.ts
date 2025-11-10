import mongoose, { Document, Schema, Types } from 'mongoose';

export interface UserDocument extends Document {
	_id: Types.ObjectId;
	fullName: string;
	email: string;
}

const userSchema = new Schema<UserDocument>(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true },
	},
	{ timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);

