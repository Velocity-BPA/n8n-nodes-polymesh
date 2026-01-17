/**
 * Polymesh Claims Utilities
 * 
 * Helper functions for working with Polymesh claims.
 */

import { CLAIM_TYPES, JURISDICTIONS } from '../constants/claimTypes';

// Claim structure
export interface PolymeshClaim {
	type: string;
	scope?: ClaimScope;
	issuedAt?: Date;
	expiry?: Date | null;
	issuer: string;
	target: string;
	jurisdiction?: string;
	customClaimTypeId?: string;
	cddId?: string;
}

// Claim scope
export interface ClaimScope {
	type: 'Identity' | 'Ticker' | 'Custom';
	value: string;
}

/**
 * Check if a claim type is valid
 */
export function isValidClaimType(claimType: string): boolean {
	return Object.values(CLAIM_TYPES).includes(claimType as typeof CLAIM_TYPES[keyof typeof CLAIM_TYPES]);
}

/**
 * Check if a jurisdiction code is valid
 */
export function isValidJurisdiction(code: string): boolean {
	return code in JURISDICTIONS;
}

/**
 * Parse a claim from SDK result
 */
export function parseClaim(claim: unknown): PolymeshClaim | null {
	if (!claim || typeof claim !== 'object') {
		return null;
	}
	
	const c = claim as Record<string, unknown>;
	
	return {
		type: c.type as string,
		scope: c.scope as ClaimScope | undefined,
		issuedAt: c.issuedAt ? new Date(c.issuedAt as string | number) : undefined,
		expiry: c.expiry ? new Date(c.expiry as string | number) : null,
		issuer: c.issuer as string,
		target: c.target as string,
		jurisdiction: c.jurisdiction as string | undefined,
		customClaimTypeId: c.customClaimTypeId as string | undefined,
		cddId: c.cddId as string | undefined,
	};
}

/**
 * Check if a claim is expired
 */
export function isClaimExpired(claim: PolymeshClaim): boolean {
	if (!claim.expiry) {
		return false; // No expiry means never expires
	}
	return claim.expiry < new Date();
}

/**
 * Check if a claim will expire within a given number of days
 */
export function claimExpiresSoon(claim: PolymeshClaim, days: number = 30): boolean {
	if (!claim.expiry) {
		return false;
	}
	
	const warningDate = new Date();
	warningDate.setDate(warningDate.getDate() + days);
	
	return claim.expiry < warningDate;
}

/**
 * Filter claims by type
 */
export function filterClaimsByType(claims: PolymeshClaim[], type: string): PolymeshClaim[] {
	return claims.filter((claim) => claim.type === type);
}

/**
 * Get CDD claims
 */
export function getCddClaims(claims: PolymeshClaim[]): PolymeshClaim[] {
	return filterClaimsByType(claims, CLAIM_TYPES.CustomerDueDiligence);
}

/**
 * Get accredited investor claims
 */
export function getAccreditedClaims(claims: PolymeshClaim[]): PolymeshClaim[] {
	return filterClaimsByType(claims, CLAIM_TYPES.Accredited);
}

/**
 * Get jurisdiction claims
 */
export function getJurisdictionClaims(claims: PolymeshClaim[]): PolymeshClaim[] {
	return filterClaimsByType(claims, CLAIM_TYPES.Jurisdiction);
}

/**
 * Get affiliate claims
 */
export function getAffiliateClaims(claims: PolymeshClaim[]): PolymeshClaim[] {
	return filterClaimsByType(claims, CLAIM_TYPES.Affiliate);
}

/**
 * Get exempted claims
 */
export function getExemptedClaims(claims: PolymeshClaim[]): PolymeshClaim[] {
	return filterClaimsByType(claims, CLAIM_TYPES.Exempted);
}

/**
 * Get blocked claims
 */
export function getBlockedClaims(claims: PolymeshClaim[]): PolymeshClaim[] {
	return filterClaimsByType(claims, CLAIM_TYPES.Blocked);
}

/**
 * Get investor uniqueness claims
 */
export function getInvestorUniquenessClaims(claims: PolymeshClaim[]): PolymeshClaim[] {
	return claims.filter((claim) => 
		claim.type === CLAIM_TYPES.InvestorUniqueness ||
		claim.type === CLAIM_TYPES.InvestorUniquenessV2
	);
}

/**
 * Find the most recent valid CDD claim
 */
export function findValidCddClaim(claims: PolymeshClaim[]): PolymeshClaim | null {
	const cddClaims = getCddClaims(claims)
		.filter((claim) => !isClaimExpired(claim))
		.sort((a, b) => {
			if (!a.issuedAt || !b.issuedAt) return 0;
			return b.issuedAt.getTime() - a.issuedAt.getTime();
		});
	
	return cddClaims[0] || null;
}

/**
 * Check if identity has a specific claim type
 */
export function hasClaimType(claims: PolymeshClaim[], type: string): boolean {
	return claims.some((claim) => claim.type === type && !isClaimExpired(claim));
}

/**
 * Check if identity is from a specific jurisdiction
 */
export function hasJurisdiction(claims: PolymeshClaim[], jurisdiction: string): boolean {
	return claims.some(
		(claim) =>
			claim.type === CLAIM_TYPES.Jurisdiction &&
			claim.jurisdiction === jurisdiction &&
			!isClaimExpired(claim)
	);
}

/**
 * Build a claim object for adding
 */
export function buildClaim(params: {
	type: string;
	scope?: ClaimScope;
	expiry?: Date | null;
	jurisdiction?: string;
	customClaimTypeId?: string;
}): Record<string, unknown> {
	const claim: Record<string, unknown> = {
		type: params.type,
	};
	
	if (params.scope) {
		claim.scope = params.scope;
	}
	
	if (params.expiry) {
		claim.expiry = params.expiry;
	}
	
	if (params.jurisdiction) {
		claim.jurisdiction = params.jurisdiction;
	}
	
	if (params.customClaimTypeId) {
		claim.customClaimTypeId = params.customClaimTypeId;
	}
	
	return claim;
}

/**
 * Format claim for display
 */
export function formatClaimForDisplay(claim: PolymeshClaim): Record<string, string> {
	return {
		Type: claim.type,
		Issuer: claim.issuer,
		Target: claim.target,
		Scope: claim.scope ? `${claim.scope.type}: ${claim.scope.value}` : 'None',
		Jurisdiction: claim.jurisdiction || 'N/A',
		'Issued At': claim.issuedAt?.toISOString() || 'Unknown',
		Expiry: claim.expiry?.toISOString() || 'Never',
		Status: isClaimExpired(claim) ? 'Expired' : 'Active',
	};
}
