import { env } from '../config/env';

export interface StoreRecordRequest {
	recordType: 'grade' | 'certificate' | 'attendance' | 'enrollment';
	recordId: string;
	data: any;
	metadata?: any;
}

export class BlockchainClient {
	private baseUrl: string;

	constructor() {
		this.baseUrl = env.blockchainServiceUrl;
	}

	async storeRecord(request: StoreRecordRequest): Promise<string> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/blockchain/store`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request),
			});
			if (!response.ok) {
				throw new Error(`Blockchain service error: ${response.statusText}`);
			}
			const result = await response.json();
			return result.transactionHash;
		} catch (error) {
			console.error('Error storing record on blockchain:', error);
			throw error;
		}
	}

	async verifyRecord(recordId: string, recordType: string): Promise<boolean> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/v1/blockchain/verify/${recordId}?recordType=${recordType}`,
				{ method: 'GET', headers: { 'Content-Type': 'application/json' } }
			);
			if (!response.ok) return false;
			const result = await response.json();
			return result.verified;
		} catch (error) {
			console.error('Error verifying record on blockchain:', error);
			return false;
		}
	}
}

export const blockchainClient = new BlockchainClient();

