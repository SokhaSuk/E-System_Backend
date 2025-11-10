/**
 * Blockchain Service Environment Configuration
 */
import dotenv from 'dotenv';

dotenv.config();

export const env = {
	// Server configuration
	port: parseInt(process.env.BLOCKCHAIN_SERVICE_PORT || '4007', 10),
	nodeEnv: process.env.NODE_ENV || 'development',

	// Database
	mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system_blockchain',

	// Blockchain Configuration
	blockchain: {
		provider: process.env.BLOCKCHAIN_PROVIDER || 'local', // 'ethereum', 'hyperledger', 'local'
		network: process.env.BLOCKCHAIN_NETWORK || 'localhost',
		privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
		contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '',
		// Ethereum specific
		ethereumRpcUrl: process.env.ETHEREUM_RPC_URL || 'http://localhost:8545',
		// Hyperledger specific
		hyperledgerGateway: process.env.HYPERLEDGER_GATEWAY || '',
		hyperledgerWallet: process.env.HYPERLEDGER_WALLET || '',
	},

	// CORS
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
		credentials: process.env.CORS_CREDENTIALS === 'true',
	},
};

