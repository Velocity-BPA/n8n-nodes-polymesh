/**
 * Polymesh SDK Client Transport Layer
 * 
 * Handles connection to the Polymesh blockchain using the official SDK.
 * Manages wallet/signer configuration and provides access to SDK methods.
 */

import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NETWORKS, NetworkType, POLYMESH_SS58_PREFIX } from '../constants/networks';

// Type for Polymesh SDK instance
export type PolymeshClient = Polymesh;

// Connection options
export interface PolymeshConnectionOptions {
	network: NetworkType | 'custom';
	customWsUrl?: string;
	seedPhrase: string;
	keyType?: 'sr25519' | 'ed25519';
	derivationPath?: string;
	middlewareUrl?: string;
	middlewareApiKey?: string;
}

// Cached connections to reuse within a workflow
const connectionCache = new Map<string, PolymeshClient>();

/**
 * Get credentials from n8n context
 */
export async function getPolymeshCredentials(
	context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<PolymeshConnectionOptions> {
	const credentials = await context.getCredentials('polymeshNetwork');
	
	return {
		network: credentials.network as NetworkType | 'custom',
		customWsUrl: credentials.customWsUrl as string | undefined,
		seedPhrase: credentials.seedPhrase as string,
		keyType: (credentials.keyType as 'sr25519' | 'ed25519') || 'sr25519',
		derivationPath: credentials.derivationPath as string | undefined,
		middlewareUrl: credentials.middlewareUrl as string | undefined,
		middlewareApiKey: credentials.middlewareApiKey as string | undefined,
	};
}

/**
 * Get the WebSocket endpoint for the specified network
 */
export function getNetworkEndpoint(
	network: NetworkType | 'custom',
	customWsUrl?: string,
): string {
	if (network === 'custom') {
		if (!customWsUrl) {
			throw new Error('Custom WebSocket URL is required when using custom network');
		}
		return customWsUrl;
	}
	
	const networkConfig = NETWORKS[network];
	if (!networkConfig) {
		throw new Error(`Unknown network: ${network}`);
	}
	
	return networkConfig.wsEndpoint;
}

/**
 * Get the middleware endpoint for the specified network
 */
export function getMiddlewareEndpoint(
	network: NetworkType | 'custom',
	customMiddlewareUrl?: string,
): string | undefined {
	if (customMiddlewareUrl) {
		return customMiddlewareUrl;
	}
	
	if (network === 'custom') {
		return undefined;
	}
	
	const networkConfig = NETWORKS[network];
	return networkConfig?.middlewareEndpoint;
}

/**
 * Create a cache key for connection reuse
 */
function createCacheKey(options: PolymeshConnectionOptions): string {
	const endpoint = getNetworkEndpoint(options.network, options.customWsUrl);
	// Don't include seed phrase in cache key for security
	return `${endpoint}-${options.derivationPath || 'default'}`;
}

/**
 * Connect to the Polymesh blockchain
 */
export async function connectToPolymesh(
	options: PolymeshConnectionOptions,
): Promise<PolymeshClient> {
	const cacheKey = createCacheKey(options);
	
	// Check cache first
	const cached = connectionCache.get(cacheKey);
	if (cached) {
		try {
			// Verify connection is still alive
			await cached.network.getLatestBlock();
			return cached;
		} catch {
			// Connection dead, remove from cache
			connectionCache.delete(cacheKey);
		}
	}
	
	// Build seed URI with optional derivation path
	let seedUri = options.seedPhrase.trim();
	if (options.derivationPath) {
		seedUri += options.derivationPath;
	}
	
	// Get endpoint
	const nodeUrl = getNetworkEndpoint(options.network, options.customWsUrl);
	const middlewareUrl = getMiddlewareEndpoint(options.network, options.middlewareUrl);
	
	// Build connection params
	const connectParams: any = {
		nodeUrl,
		accountMnemonic: seedUri,
		ss58Format: POLYMESH_SS58_PREFIX,
	};
	
	// Add middleware if configured
	if (middlewareUrl) {
		connectParams.middlewareV2 = {
			link: middlewareUrl,
			key: options.middlewareApiKey,
		};
	}
	
	// Connect to Polymesh
	const polymesh = await Polymesh.connect(connectParams);
	
	// Cache the connection
	connectionCache.set(cacheKey, polymesh);
	
	return polymesh;
}

/**
 * Connect using n8n credentials context
 */
export async function getPolymeshClient(
	context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<PolymeshClient> {
	const credentials = await getPolymeshCredentials(context);
	return connectToPolymesh(credentials);
}

/**
 * Disconnect and clean up
 */
export async function disconnectPolymesh(client: PolymeshClient): Promise<void> {
	try {
		await client.disconnect();
	} catch (error) {
		// Ignore disconnect errors
	}
}

/**
 * Clear all cached connections
 */
export async function clearConnectionCache(): Promise<void> {
	for (const [key, client] of connectionCache) {
		try {
			await client.disconnect();
		} catch {
			// Ignore
		}
		connectionCache.delete(key);
	}
}

/**
 * Get the signing identity from the connected client
 */
export async function getSigningIdentity(client: PolymeshClient) {
	const signingIdentity = await client.getSigningIdentity();
	if (!signingIdentity) {
		throw new Error(
			'No identity associated with the signing account. ' +
			'Please ensure the account has a valid CDD claim.'
		);
	}
	return signingIdentity;
}

/**
 * Get the signing account from the connected client
 */
export async function getSigningAccount(client: PolymeshClient) {
	return client.accountManagement.getSigningAccount();
}

/**
 * Check if the signing account has a valid identity
 */
export async function hasValidIdentity(client: PolymeshClient): Promise<boolean> {
	try {
		const identity = await client.getSigningIdentity();
		return identity !== null;
	} catch {
		return false;
	}
}

/**
 * Wait for a transaction to be included in a block
 */
export async function waitForTransaction(
	tx: any,
	confirmations: number = 1,
): Promise<any> {
	// If it's a Polymesh transaction with a run method, execute it
	if (tx && typeof tx.run === 'function') {
		return await tx.run();
	}
	// Otherwise treat it as a promise
	return await tx;
}

/**
 * Format an error from the Polymesh SDK
 */
export function formatPolymeshError(error: unknown): string {
	if (error instanceof Error) {
		// Check for common Polymesh errors
		const message = error.message;
		
		if (message.includes('InvalidCdd')) {
			return 'Invalid CDD: The account does not have a valid Customer Due Diligence claim.';
		}
		
		if (message.includes('NotAuthorized')) {
			return 'Not Authorized: The signing account does not have permission for this operation.';
		}
		
		if (message.includes('InsufficientBalance')) {
			return 'Insufficient Balance: Not enough POLYX to pay for the transaction.';
		}
		
		if (message.includes('IdentityNotFound')) {
			return 'Identity Not Found: The specified DID does not exist.';
		}
		
		if (message.includes('AssetNotFound')) {
			return 'Asset Not Found: The specified security token does not exist.';
		}
		
		if (message.includes('ComplianceError')) {
			return 'Compliance Error: The transfer does not meet compliance requirements.';
		}
		
		return message;
	}
	
	return String(error);
}
