import mongoose, { Document, Schema, Types } from 'mongoose';

export interface Semester {
    name: string;
    attendance: number;
    assignment: number;
    midterm: number;
    final: number;
    total: number;
    grade: string;
}

export interface ScoreRecordDocument extends Document {
    student: Types.ObjectId;
    course: Types.ObjectId;
    semesters: Semester[];
    createdAt: Date;
    updatedAt: Date;
}

// Helper to calculate Grade
const calculateGrade = (total: number): string => {
    if (total >= 90) return 'A';
    if (total >= 80) return 'B';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    if (total >= 50) return 'E';
    return 'F';
};

const semesterSchema = new Schema<Semester>(
    {
        name: { type: String, required: true },
        attendance: { type: Number, default: 0, min: 0, max: 100 },
        assignment: { type: Number, default: 0, min: 0, max: 100 },
        midterm: { type: Number, default: 0, min: 0, max: 100 },
        final: { type: Number, default: 0, min: 0, max: 100 },
        total: { type: Number, default: 0 },
        grade: { type: String, default: 'N/A' }
    },
    { _id: true } // Giving semesters IDs allows for easier specific updates
);

// Middleware to calculate total and grade before saving
semesterSchema.pre('save', function (next) {
    this.total = this.attendance + this.assignment + this.midterm + this.final;
    this.grade = calculateGrade(this.total);
    next();
});

const scoreRecordSchema = new Schema<ScoreRecordDocument>(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        semesters: [semesterSchema]
    },
    { timestamps: true }
);

// Prevent duplicate records for the same student in the same course
scoreRecordSchema.index({ student: 1, course: 1 }, { unique: true });

export const ScoreRecordModel = mongoose.model<ScoreRecordDocument>('ScoreRecord', scoreRecordSchema);