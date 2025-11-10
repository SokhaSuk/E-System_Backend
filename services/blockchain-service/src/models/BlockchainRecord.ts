/**
 * Blockchain Record Model
 * 
 * Stores metadata about records stored on the blockchain.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type RecordType = 'grade' | 'certificate' | 'attendance' | 'enrollment';

export interface BlockchainRecordDocument extends Document {
	_id: Types.ObjectId;
	recordType: RecordType;
	recordId: Types.ObjectId; // Reference to original record
	transactionHash: string; // Blockchain transaction hash
	blockNumber?: number; // Block number (if available)
	blockHash?: string; // Block hash (if available)
	metadata: {
		studentId?: Types.ObjectId;
		courseId?: Types.ObjectId;
		gradeId?: Types.ObjectId;
		[key: string]: any;
	};
	createdAt: Date;
	updatedAt: Date;
}

const blockchainRecordSchema = new Schema<BlockchainRecordDocument>(
	{
		recordType: {
			type: String,
			enum: ['grade', 'certificate', 'attendance', 'enrollment'],
			required: true,
		},
		recordId: { type: Schema.Types.ObjectId, required: true, index: true },
		transactionHash: { type: String, required: true, unique: true, index: true },
		blockNumber: { type: Number },
		blockHash: { type: String },
		metadata: { type: Schema.Types.Mixed, required: true },
	},
	{ timestamps: true }
);

// Indexes
blockchainRecordSchema.index({ recordType: 1, recordId: 1 });
blockchainRecordSchema.index({ transactionHash: 1 });

export const BlockchainRecordModel = mongoose.model<BlockchainRecordDocument>(
	'BlockchainRecord',
	blockchainRecordSchema
);

