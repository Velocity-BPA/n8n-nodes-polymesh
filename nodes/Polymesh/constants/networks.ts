/**
 * Polymesh Network Configuration Constants
 * 
 * Polymesh is an institutional-grade security token blockchain with
 * built-in identity, compliance, and settlement features.
 */

export const POLYMESH_SS58_PREFIX = 12;

export const POLYX_DECIMALS = 6;

export const NETWORKS = {
	mainnet: {
		name: 'Polymesh Mainnet',
		wsEndpoint: 'wss://mainnet-rpc.polymesh.network',
		middlewareEndpoint: 'https://mainnet-graphql.polymesh.network/graphql',
		chainId: 'polymesh-mainnet',
		ss58Prefix: POLYMESH_SS58_PREFIX,
		explorerUrl: 'https://polymesh.subscan.io',
		isTestnet: false,
	},
	testnet: {
		name: 'Polymesh Testnet',
		wsEndpoint: 'wss://testnet-rpc.polymesh.live',
		middlewareEndpoint: 'https://testnet-graphql.polymesh.live/graphql',
		chainId: 'polymesh-testnet',
		ss58Prefix: POLYMESH_SS58_PREFIX,
		explorerUrl: 'https://polymesh-testnet.subscan.io',
		isTestnet: true,
	},
	staging: {
		name: 'Polymesh Staging (ITN)',
		wsEndpoint: 'wss://staging-rpc.polymesh.dev',
		middlewareEndpoint: 'https://staging-graphql.polymesh.dev/graphql',
		chainId: 'polymesh-staging',
		ss58Prefix: POLYMESH_SS58_PREFIX,
		explorerUrl: '',
		isTestnet: true,
	},
	local: {
		name: 'Local Development',
		wsEndpoint: 'ws://127.0.0.1:9944',
		middlewareEndpoint: 'http://localhost:3000/graphql',
		chainId: 'polymesh-local',
		ss58Prefix: POLYMESH_SS58_PREFIX,
		explorerUrl: '',
		isTestnet: true,
	},
} as const;

export type NetworkType = keyof typeof NETWORKS;

// Default connection settings
export const CONNECTION_DEFAULTS = {
	timeout: 60000,
	retryCount: 3,
	retryDelay: 1000,
};

// Block confirmation settings
export const CONFIRMATION_SETTINGS = {
	defaultConfirmations: 1,
	maxWaitBlocks: 100,
	blockTime: 6000, // 6 seconds per block
};

// Transaction settings
export const TRANSACTION_SETTINGS = {
	defaultTip: '0',
	mortalityPeriod: 64, // blocks
};
