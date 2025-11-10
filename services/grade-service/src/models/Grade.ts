/**
 * Grade Model
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type GradeType =
	| 'assignment'
	| 'quiz'
	| 'exam'
	| 'project'
	| 'participation'
	| 'final';

export interface GradeDocument extends Document {
	_id: Types.ObjectId;
	student: Types.ObjectId;
	course: Types.ObjectId;
	gradeType: GradeType;
	title: string;
	score: number;
	maxScore: number;
	percentage: number;
	letterGrade: string;
	comments?: string;
	submittedAt?: Date;
	gradedBy: Types.ObjectId;
	blockchainHash?: string;
	createdAt: Date;
	updatedAt: Date;
}

const gradeSchema = new Schema<GradeDocument>(
	{
		student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
		gradeType: {
			type: String,
			enum: ['assignment', 'quiz', 'exam', 'project', 'participation', 'final'],
			required: true,
		},
		title: { type: String, required: true, trim: true },
		score: { type: Number, required: true, min: 0 },
		maxScore: { type: Number, required: true, min: 1 },
		percentage: { type: Number, required: true, min: 0, max: 100 },
		letterGrade: { type: String, required: true },
		comments: { type: String, trim: true },
		submittedAt: { type: Date },
		gradedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		blockchainHash: { type: String },
	},
	{ timestamps: true }
);

// Pre-save middleware to calculate percentage and letter grade
gradeSchema.pre('save', function (next) {
	if (this.isModified('score') || this.isModified('maxScore')) {
		this.percentage = (this.score / this.maxScore) * 100;
		this.letterGrade = calculateLetterGrade(this.percentage);
	}
	next();
});

function calculateLetterGrade(percentage: number): string {
	if (percentage >= 93) return 'A';
	if (percentage >= 90) return 'A-';
	if (percentage >= 87) return 'B+';
	if (percentage >= 83) return 'B';
	if (percentage >= 80) return 'B-';
	if (percentage >= 77) return 'C+';
	if (percentage >= 73) return 'C';
	if (percentage >= 70) return 'C-';
	if (percentage >= 67) return 'D+';
	if (percentage >= 63) return 'D';
	if (percentage >= 60) return 'D-';
	return 'F';
}

// Indexes
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ course: 1, gradeType: 1 });
gradeSchema.index({ student: 1, gradeType: 1 });

export const GradeModel = mongoose.model<GradeDocument>('Grade', gradeSchema);

