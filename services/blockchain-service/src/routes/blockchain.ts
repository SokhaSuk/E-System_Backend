/**
 * Blockchain Routes
 */
import { Router, Request, Response } from 'express';
import { blockchainService } from '../services/blockchain.service';

export const blockchainRouter = Router();

/**
 * POST /api/v1/blockchain/store
 * Store a record on the blockchain
 */
blockchainRouter.post('/store', async (req: Request, res: Response) => {
	try {
		const { recordType, recordId, data, metadata } = req.body;
		
		if (!recordType || !recordId || !data) {
			return res.status(400).json({
				error: 'Missing required fields: recordType, recordId, data',
			});
		}
		
		const transactionHash = await blockchainService.storeRecord({
			recordType,
			recordId,
			data,
			metadata,
		});
		
		res.json({
			success: true,
			transactionHash,
			message: 'Record stored on blockchain successfully',
		});
	} catch (error: any) {
		res.status(500).json({
			error: 'Failed to store record on blockchain',
			message: error.message,
		});
	}
});

/**
 * GET /api/v1/blockchain/verify/:recordId
 * Verify a record from the blockchain
 */
blockchainRouter.get('/verify/:recordId', async (req: Request, res: Response) => {
	try {
		const { recordId } = req.params;
		const { recordType } = req.query;
		
		if (!recordType) {
			return res.status(400).json({
				error: 'Missing required parameter: recordType',
			});
		}
		
		const isValid = await blockchainService.verifyRecord(
			recordId,
			recordType as any
		);
		
		res.json({
			success: true,
			verified: isValid,
			recordId,
			recordType,
		});
	} catch (error: any) {
		res.status(500).json({
			error: 'Failed to verify record',
			message: error.message,
		});
	}
});

/**
 * GET /api/v1/blockchain/record/:recordId
 * Get record information from blockchain
 */
blockchainRouter.get('/record/:recordId', async (req: Request, res: Response) => {
	try {
		const { recordId } = req.params;
		const { recordType } = req.query;
		
		if (!recordType) {
			return res.status(400).json({
				error: 'Missing required parameter: recordType',
			});
		}
		
		const record = await blockchainService.getRecord(
			recordId,
			recordType as any
		);
		
		if (!record) {
			return res.status(404).json({
				error: 'Record not found on blockchain',
			});
		}
		
		res.json({
			success: true,
			record: {
				recordType: record.recordType,
				recordId: record.recordId,
				transactionHash: record.transactionHash,
				blockNumber: record.blockNumber,
				blockHash: record.blockHash,
				metadata: record.metadata,
				createdAt: record.createdAt,
			},
		});
	} catch (error: any) {
		res.status(500).json({
			error: 'Failed to get record',
			message: error.message,
		});
	}
});

export default blockchainRouter;

