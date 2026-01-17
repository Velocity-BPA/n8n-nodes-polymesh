/**
 * Polymesh Identity Operations
 * 
 * Handles all identity-related operations including CDD, secondary keys,
 * and authorization management.
 */

import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError } from '../../transport/polymeshClient';
import { isValidDid, normalizeDid, formatDid } from '../../utils/identityUtils';

// Identity operation types
export type IdentityOperation =
	| 'getIdentity'
	| 'getMyIdentity'
	| 'getIdentityClaims'
	| 'getIdentityAssets'
	| 'getIdentityPortfolios'
	| 'getIdentityVenues'
	| 'getIdentityAuthorizations'
	| 'addSecondaryKey'
	| 'removeSecondaryKey'
	| 'getSecondaryKeys'
	| 'freezeSecondaryKeys'
	| 'unfreezeSecondaryKeys'
	| 'leaveIdentity'
	| 'getIdentityRoles'
	| 'getTrustedClaimIssuers'
	| 'rotatePrimaryKey';

/**
 * Execute an identity operation
 */
export async function executeIdentityOperation(
	this: IExecuteFunctions,
	operation: IdentityOperation,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient(this);
	
	try {
		switch (operation) {
			case 'getIdentity':
				return await getIdentity.call(this, polymesh, itemIndex);
			case 'getMyIdentity':
				return await getMyIdentity.call(this, polymesh, itemIndex);
			case 'getIdentityClaims':
				return await getIdentityClaims.call(this, polymesh, itemIndex);
			case 'getIdentityAssets':
				return await getIdentityAssets.call(this, polymesh, itemIndex);
			case 'getIdentityPortfolios':
				return await getIdentityPortfolios.call(this, polymesh, itemIndex);
			case 'getIdentityVenues':
				return await getIdentityVenues.call(this, polymesh, itemIndex);
			case 'getIdentityAuthorizations':
				return await getIdentityAuthorizations.call(this, polymesh, itemIndex);
			case 'addSecondaryKey':
				return await addSecondaryKey.call(this, polymesh, itemIndex);
			case 'removeSecondaryKey':
				return await removeSecondaryKey.call(this, polymesh, itemIndex);
			case 'getSecondaryKeys':
				return await getSecondaryKeys.call(this, polymesh, itemIndex);
			case 'freezeSecondaryKeys':
				return await freezeSecondaryKeys.call(this, polymesh, itemIndex);
			case 'unfreezeSecondaryKeys':
				return await unfreezeSecondaryKeys.call(this, polymesh, itemIndex);
			case 'leaveIdentity':
				return await leaveIdentity.call(this, polymesh, itemIndex);
			case 'getIdentityRoles':
				return await getIdentityRoles.call(this, polymesh, itemIndex);
			case 'getTrustedClaimIssuers':
				return await getTrustedClaimIssuers.call(this, polymesh, itemIndex);
			case 'rotatePrimaryKey':
				return await rotatePrimaryKey.call(this, polymesh, itemIndex);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unknown identity operation: ${operation}`,
				);
		}
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			formatPolymeshError(error),
			{ itemIndex },
		);
	}
}

/**
 * Get identity by DID
 */
async function getIdentity(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', itemIndex) as string;
	
	if (!isValidDid(did)) {
		throw new NodeOperationError(this.getNode(), 'Invalid DID format', { itemIndex });
	}
	
	const normalizedDid = normalizeDid(did);
	const identity = await polymesh.identities.getIdentity({ did: normalizedDid });
	
	// Get additional details
	const [primaryAccount, hasCdd] = await Promise.all([
		identity.getPrimaryAccount(),
		identity.hasValidCdd(),
	]);
	
	return [{
		json: {
			did: identity.did,
			primaryAccount: primaryAccount?.account?.address,
			hasCdd,
		},
	}];
}

/**
 * Get the signing identity
 */
async function getMyIdentity(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(
			this.getNode(),
			'No identity associated with the signing account',
			{ itemIndex },
		);
	}
	
	const [primaryAccount, hasCdd, secondaryAccounts] = await Promise.all([
		identity.getPrimaryAccount(),
		identity.hasValidCdd(),
		identity.getSecondaryAccounts(),
	]);
	
	return [{
		json: {
			did: identity.did,
			primaryAccount: primaryAccount?.account?.address,
			hasCdd,
			secondaryAccountCount: secondaryAccounts?.data?.length || 0,
		},
	}];
}

/**
 * Get claims for an identity
 */
async function getIdentityClaims(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', itemIndex) as string;
	const claimType = this.getNodeParameter('claimType', itemIndex, '') as string;
	const includeExpired = this.getNodeParameter('includeExpired', itemIndex, false) as boolean;
	
	const identity = await polymesh.identities.getIdentity({ did: normalizeDid(did) });
	
	const claimOptions: Record<string, unknown> = {};
	if (claimType) {
		claimOptions.claimTypes = [claimType];
	}
	claimOptions.includeExpired = includeExpired;
	
	const claims = await identity.getClaims(claimOptions);
	
	return [{
		json: {
			did: identity.did,
			claimCount: claims.data?.length || 0,
			claims: claims.data?.map((claim: any) => ({
				type: claim.claim?.type,
				issuer: claim.issuer?.did,
				scope: claim.claim?.scope,
				issuedAt: claim.issuanceDate,
				expiry: claim.expiry,
			})) || [],
		},
	}];
}

/**
 * Get assets owned by an identity
 */
async function getIdentityAssets(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', itemIndex) as string;
	
	const identity = await polymesh.identities.getIdentity({ did: normalizeDid(did) });
	const assets = await identity.getHeldAssets();
	
	return [{
		json: {
			did: identity.did,
			assetCount: assets.data?.length || 0,
			assets: assets.data?.map((asset: any) => ({
				ticker: asset.ticker,
				name: asset.name,
				totalSupply: asset.totalSupply?.toString(),
			})) || [],
		},
	}];
}

/**
 * Get portfolios for an identity
 */
async function getIdentityPortfolios(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', itemIndex) as string;
	
	const identity = await polymesh.identities.getIdentity({ did: normalizeDid(did) });
	const portfolios = await identity.portfolios.getPortfolios();
	
	const portfolioDetails = await Promise.all(
		portfolios.map(async (portfolio: any) => {
			const [name, isCustodied] = await Promise.all([
				portfolio.getName?.() || 'Default',
				portfolio.isCustodiedBy?.(),
			]);
			return {
				id: portfolio.id?.toString(),
				name,
				isCustodied: !!isCustodied,
			};
		}),
	);
	
	return [{
		json: {
			did: identity.did,
			portfolioCount: portfolios.length,
			portfolios: portfolioDetails,
		},
	}];
}

/**
 * Get venues created by an identity
 */
async function getIdentityVenues(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', itemIndex) as string;
	
	const identity = await polymesh.identities.getIdentity({ did: normalizeDid(did) });
	const venues = await identity.getVenues();
	
	const venueDetails = await Promise.all(
		venues.map(async (venue: any) => {
			const details = await venue.details();
			return {
				id: venue.id?.toString(),
				type: details.type,
				description: details.description,
			};
		}),
	);
	
	return [{
		json: {
			did: identity.did,
			venueCount: venues.length,
			venues: venueDetails,
		},
	}];
}

/**
 * Get pending authorizations for an identity
 */
async function getIdentityAuthorizations(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', itemIndex) as string;
	const authType = this.getNodeParameter('authorizationType', itemIndex, '') as string;
	
	const identity = await polymesh.identities.getIdentity({ did: normalizeDid(did) });
	
	const options: Record<string, unknown> = {};
	if (authType) {
		options.type = authType;
	}
	
	const [received, sent] = await Promise.all([
		identity.authorizations.getReceived(options),
		identity.authorizations.getSent(options),
	]);
	
	return [{
		json: {
			did: identity.did,
			receivedCount: received.data?.length || 0,
			sentCount: sent.data?.length || 0,
			received: received.data?.map((auth: any) => ({
				id: auth.authId?.toString(),
				type: auth.data?.type,
				issuer: auth.issuer?.did,
				expiry: auth.expiry,
			})) || [],
			sent: sent.data?.map((auth: any) => ({
				id: auth.authId?.toString(),
				type: auth.data?.type,
				target: auth.target?.did,
				expiry: auth.expiry,
			})) || [],
		},
	}];
}

/**
 * Add a secondary key to the identity
 */
async function addSecondaryKey(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const targetAccount = this.getNodeParameter('targetAccount', itemIndex) as string;
	const permissions = this.getNodeParameter('permissions', itemIndex, {}) as Record<string, unknown>;
	
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(
			this.getNode(),
			'No identity associated with signing account',
			{ itemIndex },
		);
	}
	
	// Create invitation for secondary key
	const tx = await identity.secondaryAccounts.inviteAccount({
		targetAccount,
		permissions: permissions || undefined,
	});
	
	const result = await tx.run();
	
	return [{
		json: {
			success: true,
			authorizationId: result?.authId?.toString(),
			targetAccount,
			message: 'Secondary key invitation sent. Target must accept authorization.',
		},
	}];
}

/**
 * Remove a secondary key from the identity
 */
async function removeSecondaryKey(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const targetAccount = this.getNodeParameter('targetAccount', itemIndex) as string;
	
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(
			this.getNode(),
			'No identity associated with signing account',
			{ itemIndex },
		);
	}
	
	const tx = await identity.secondaryAccounts.revokePermissions({
		secondaryAccounts: [targetAccount],
	});
	
	await tx.run();
	
	return [{
		json: {
			success: true,
			removedAccount: targetAccount,
		},
	}];
}

/**
 * Get secondary keys for an identity
 */
async function getSecondaryKeys(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', itemIndex, '') as string;
	
	let identity;
	if (did) {
		identity = await polymesh.identities.getIdentity({ did: normalizeDid(did) });
	} else {
		identity = await polymesh.getSigningIdentity();
	}
	
	if (!identity) {
		throw new NodeOperationError(
			this.getNode(),
			'No identity found',
			{ itemIndex },
		);
	}
	
	const secondaryAccounts = await identity.getSecondaryAccounts();
	
	return [{
		json: {
			did: identity.did,
			secondaryAccountCount: secondaryAccounts.data?.length || 0,
			secondaryAccounts: secondaryAccounts.data?.map((sa: any) => ({
				account: sa.account?.address,
				permissions: sa.permissions,
			})) || [],
		},
	}];
}

/**
 * Freeze secondary keys
 */
async function freezeSecondaryKeys(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(
			this.getNode(),
			'No identity associated with signing account',
			{ itemIndex },
		);
	}
	
	const tx = await identity.secondaryAccounts.freeze();
	await tx.run();
	
	return [{
		json: {
			success: true,
			did: identity.did,
			message: 'Secondary keys frozen',
		},
	}];
}

/**
 * Unfreeze secondary keys
 */
async function unfreezeSecondaryKeys(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(
			this.getNode(),
			'No identity associated with signing account',
			{ itemIndex },
		);
	}
	
	const tx = await identity.secondaryAccounts.unfreeze();
	await tx.run();
	
	return [{
		json: {
			success: true,
			did: identity.did,
			message: 'Secondary keys unfrozen',
		},
	}];
}

/**
 * Leave identity (as secondary key)
 */
async function leaveIdentity(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const account = await polymesh.accountManagement.getSigningAccount();
	
	const tx = await account.leaveIdentity();
	await tx.run();
	
	return [{
		json: {
			success: true,
			message: 'Left identity successfully',
		},
	}];
}

/**
 * Get roles for an identity
 */
async function getIdentityRoles(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', itemIndex, '') as string;
	
	let identity;
	if (did) {
		identity = await polymesh.identities.getIdentity({ did: normalizeDid(did) });
	} else {
		identity = await polymesh.getSigningIdentity();
	}
	
	if (!identity) {
		throw new NodeOperationError(
			this.getNode(),
			'No identity found',
			{ itemIndex },
		);
	}
	
	// Check various roles
	const [isCddProvider, isCommitteeMember] = await Promise.all([
		identity.isCddProvider?.() || false,
		identity.isGcMember?.() || false,
	]);
	
	return [{
		json: {
			did: identity.did,
			roles: {
				isCddProvider,
				isCommitteeMember,
			},
		},
	}];
}

/**
 * Get trusted claim issuers for an asset
 */
async function getTrustedClaimIssuers(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', itemIndex) as string;
	
	const asset = await polymesh.assets.getAsset({ ticker: ticker.toUpperCase() });
	const trustedIssuers = await asset.compliance.trustedClaimIssuers.get();
	
	return [{
		json: {
			ticker: ticker.toUpperCase(),
			trustedIssuers: trustedIssuers.map((issuer: any) => ({
				did: issuer.identity?.did,
				trustedFor: issuer.trustedFor,
			})),
		},
	}];
}

/**
 * Rotate primary key
 */
async function rotatePrimaryKey(
	this: IExecuteFunctions,
	polymesh: any,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const targetAccount = this.getNodeParameter('targetAccount', itemIndex) as string;
	
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(
			this.getNode(),
			'No identity associated with signing account',
			{ itemIndex },
		);
	}
	
	const tx = await identity.primaryAccount.rotate({ targetAccount });
	const result = await tx.run();
	
	return [{
		json: {
			success: true,
			did: identity.did,
			authorizationId: result?.authId?.toString(),
			message: 'Primary key rotation initiated. Target must accept.',
		},
	}];
}
