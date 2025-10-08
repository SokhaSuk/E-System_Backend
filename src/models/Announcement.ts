/**
 * Announcement domain model (Mongoose).
 *
 * Defines the `Announcement` schema and TypeScript types for announcements.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type AnnouncementType = 'general' | 'course' | 'academic' | 'emergency';

export interface AnnouncementDocument extends Document {
	_id: Types.ObjectId;
	title: string;
	content: string;
	type: AnnouncementType;
	author: Types.ObjectId;
	targetAudience: string[];
	course?: Types.ObjectId;
	isActive: boolean;
	publishedAt: Date;
	expiresAt?: Date;
	attachments?: string[];
	createdAt: Date;
	updatedAt: Date;
}

const announcementSchema = new Schema<AnnouncementDocument>(
	{
		title: { type: String, required: true, trim: true },
		content: { type: String, required: true },
		type: {
			type: String,
			enum: ['general', 'course', 'academic', 'emergency'],
			required: true,
			default: 'general',
		},
		author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		targetAudience: [
			{
				type: String,
				enum: ['admin', 'teacher', 'student', 'all'],
				default: ['all'],
			},
		],
		course: { type: Schema.Types.ObjectId, ref: 'Course' },
		isActive: { type: Boolean, default: true },
		publishedAt: { type: Date, default: Date.now },
		expiresAt: { type: Date },
		attachments: [{ type: String }],
	},
	{ timestamps: true }
);

// Indexes for efficient queries
announcementSchema.index({ type: 1, isActive: 1, publishedAt: -1 });
announcementSchema.index({ course: 1, isActive: 1, publishedAt: -1 });
announcementSchema.index({ targetAudience: 1, isActive: 1, publishedAt: -1 });

// Virtual for checking if announcement is expired
announcementSchema.virtual('isExpired').get(function () {
	if (!this.expiresAt) return false;
	return new Date() > this.expiresAt;
});

export const AnnouncementModel = mongoose.model<AnnouncementDocument>(
	'Announcement',
	announcementSchema
);
