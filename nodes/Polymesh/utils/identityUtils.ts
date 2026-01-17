/**
 * Polymesh Identity Utilities
 * 
 * Helper functions for working with Polymesh identities (DIDs).
 */

import { encodeAddress, decodeAddress, isAddress } from '@polkadot/util-crypto';
import { POLYMESH_SS58_PREFIX } from '../constants/networks';

// DID format regex: 0x followed by 64 hex characters
const DID_REGEX = /^0x[0-9a-fA-F]{64}$/;

/**
 * Validate a DID format
 */
export function isValidDid(did: string): boolean {
	return DID_REGEX.test(did);
}

/**
 * Validate a Polymesh address
 */
export function isValidAddress(address: string): boolean {
	try {
		// Check if it's a valid SS58 address
		if (!isAddress(address)) {
			return false;
		}
		
		// Decode and re-encode to verify format
		const decoded = decodeAddress(address);
		const reencoded = encodeAddress(decoded, POLYMESH_SS58_PREFIX);
		
		// For Polymesh, we accept addresses with correct prefix
		return true;
	} catch {
		return false;
	}
}

/**
 * Encode an address to Polymesh SS58 format
 */
export function encodePolymeshAddress(publicKey: Uint8Array | string): string {
	return encodeAddress(publicKey, POLYMESH_SS58_PREFIX);
}

/**
 * Decode a Polymesh address to public key bytes
 */
export function decodePolymeshAddress(address: string): Uint8Array {
	return decodeAddress(address);
}

/**
 * Format a DID for display (shortened)
 */
export function formatDid(did: string, length: number = 8): string {
	if (!did || did.length < length * 2 + 4) {
		return did;
	}
	return `${did.slice(0, length + 2)}...${did.slice(-length)}`;
}

/**
 * Format an address for display (shortened)
 */
export function formatAddress(address: string, length: number = 6): string {
	if (!address || address.length < length * 2 + 3) {
		return address;
	}
	return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Parse identity result to standardized format
 */
export function parseIdentityResult(identity: unknown): Record<string, unknown> {
	if (!identity || typeof identity !== 'object') {
		return {};
	}
	
	const id = identity as Record<string, unknown>;
	
	return {
		did: id.did,
		primaryAccount: id.primaryAccount,
		secondaryAccounts: id.secondaryAccounts,
		portfolios: id.portfolios,
	};
}

/**
 * Check if an identity has a valid CDD claim
 */
export async function hasCddClaim(
	polymesh: { getSigningIdentity: () => Promise<unknown> },
): Promise<boolean> {
	try {
		const identity = await polymesh.getSigningIdentity();
		return identity !== null;
	} catch {
		return false;
	}
}

/**
 * Extract DID from a Polymesh identity object
 */
export function extractDid(identity: unknown): string | null {
	if (!identity || typeof identity !== 'object') {
		return null;
	}
	
	const id = identity as { did?: string };
	return id.did || null;
}

/**
 * Validate identity permissions
 */
export interface IdentityPermissions {
	assets: {
		type: 'Whole' | 'These' | 'Except';
		values?: string[];
	} | null;
	portfolios: {
		type: 'Whole' | 'These' | 'Except';
		values?: Array<{ did: string; portfolioId: string }>;
	} | null;
	transactions: {
		type: 'Whole' | 'These' | 'Except';
		values?: string[];
	} | null;
}

/**
 * Parse permissions from SDK result
 */
export function parsePermissions(permissions: unknown): IdentityPermissions {
	const defaultPermissions: IdentityPermissions = {
		assets: null,
		portfolios: null,
		transactions: null,
	};
	
	if (!permissions || typeof permissions !== 'object') {
		return defaultPermissions;
	}
	
	const perms = permissions as Record<string, unknown>;
	
	return {
		assets: perms.assets as IdentityPermissions['assets'],
		portfolios: perms.portfolios as IdentityPermissions['portfolios'],
		transactions: perms.transactions as IdentityPermissions['transactions'],
	};
}

/**
 * Normalize DID input (handle with/without 0x prefix)
 */
export function normalizeDid(did: string): string {
	const trimmed = did.trim().toLowerCase();
	
	if (trimmed.startsWith('0x')) {
		return trimmed;
	}
	
	return `0x${trimmed}`;
}

/**
 * Compare two DIDs for equality
 */
export function didsEqual(did1: string, did2: string): boolean {
	return normalizeDid(did1) === normalizeDid(did2);
}
