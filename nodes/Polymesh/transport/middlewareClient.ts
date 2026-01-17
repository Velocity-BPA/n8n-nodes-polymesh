/**
 * Polymesh Middleware GraphQL Client
 * 
 * Handles queries to the Polymesh Subquery middleware for enhanced
 * historical data queries and analytics.
 */

import { GraphQLClient, gql } from 'graphql-request';
import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NETWORKS, NetworkType } from '../constants/networks';

// Middleware client type
export type MiddlewareClient = GraphQLClient;

// Middleware options
export interface MiddlewareOptions {
	endpoint: string;
	apiKey?: string;
	timeout?: number;
}

/**
 * Get middleware credentials from n8n context
 */
export async function getMiddlewareCredentials(
	context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<MiddlewareOptions | null> {
	try {
		const credentials = await context.getCredentials('polymeshMiddleware');
		
		const environment = credentials.environment as string;
		let endpoint: string;
		
		if (environment === 'custom') {
			endpoint = credentials.graphqlEndpoint as string;
		} else {
			endpoint = NETWORKS[environment as NetworkType]?.middlewareEndpoint || '';
		}
		
		if (!endpoint) {
			return null;
		}
		
		return {
			endpoint,
			apiKey: credentials.apiKey as string | undefined,
			timeout: (credentials.timeout as number) || 30000,
		};
	} catch {
		// Middleware credentials are optional
		return null;
	}
}

/**
 * Create a middleware GraphQL client
 */
export function createMiddlewareClient(options: MiddlewareOptions): MiddlewareClient {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	
	if (options.apiKey) {
		headers['Authorization'] = `Bearer ${options.apiKey}`;
	}
	
	return new GraphQLClient(options.endpoint, {
		headers,
	} as any);
}

/**
 * Get middleware client from n8n context
 */
export async function getMiddlewareClient(
	context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<MiddlewareClient | null> {
	const credentials = await getMiddlewareCredentials(context);
	if (!credentials) {
		return null;
	}
	return createMiddlewareClient(credentials);
}

// Common GraphQL queries

/**
 * Get transaction history for an identity
 */
export const GET_TRANSACTIONS_BY_DID = gql`
	query GetTransactionsByDid($did: String!, $first: Int, $offset: Int) {
		extrinsics(
			filter: { signerId: { equalTo: $did } }
			first: $first
			offset: $offset
			orderBy: BLOCK_ID_DESC
		) {
			nodes {
				extrinsicIdx
				blockId
				address
				nonce
				moduleId
				callId
				params
				success
				signedbyAddress
				block {
					blockId
					datetime
					hash
				}
			}
			totalCount
		}
	}
`;

/**
 * Get asset transfers
 */
export const GET_ASSET_TRANSFERS = gql`
	query GetAssetTransfers($ticker: String!, $first: Int, $offset: Int) {
		assetTransactions(
			filter: { assetId: { equalTo: $ticker } }
			first: $first
			offset: $offset
			orderBy: CREATED_BLOCK_ID_DESC
		) {
			nodes {
				id
				assetId
				amount
				fromPortfolioId
				toPortfolioId
				instructionId
				instructionMemo
				createdBlock {
					blockId
					datetime
					hash
				}
				eventIdx
			}
			totalCount
		}
	}
`;

/**
 * Get settlement instructions
 */
export const GET_INSTRUCTIONS = gql`
	query GetInstructions($venueId: String, $first: Int, $offset: Int) {
		instructions(
			filter: { venueId: { equalTo: $venueId } }
			first: $first
			offset: $offset
			orderBy: CREATED_BLOCK_ID_DESC
		) {
			nodes {
				id
				venueId
				status
				type
				memo
				tradeDate
				valueDate
				legs {
					nodes {
						legIndex
						from
						to
						assetId
						amount
					}
				}
				createdBlock {
					blockId
					datetime
				}
			}
			totalCount
		}
	}
`;

/**
 * Get corporate actions for an asset
 */
export const GET_CORPORATE_ACTIONS = gql`
	query GetCorporateActions($ticker: String!, $first: Int, $offset: Int) {
		corporateActions(
			filter: { assetId: { equalTo: $ticker } }
			first: $first
			offset: $offset
			orderBy: CREATED_BLOCK_ID_DESC
		) {
			nodes {
				id
				assetId
				kind
				declarationDate
				recordDate
				targets
				defaultWithholdingTax
				withholdingTax
				createdBlock {
					blockId
					datetime
				}
			}
			totalCount
		}
	}
`;

/**
 * Get claims for an identity
 */
export const GET_CLAIMS_BY_DID = gql`
	query GetClaimsByDid($did: String!, $first: Int, $offset: Int) {
		claims(
			filter: { targetId: { equalTo: $did } }
			first: $first
			offset: $offset
			orderBy: CREATED_BLOCK_ID_DESC
		) {
			nodes {
				id
				targetId
				issuerId
				type
				scope
				jurisdiction
				expiry
				issuanceDate
				lastUpdateDate
				cddId
				revokeDate
			}
			totalCount
		}
	}
`;

/**
 * Get portfolios for an identity
 */
export const GET_PORTFOLIOS_BY_DID = gql`
	query GetPortfoliosByDid($did: String!, $first: Int, $offset: Int) {
		portfolios(
			filter: { identityId: { equalTo: $did } }
			first: $first
			offset: $offset
		) {
			nodes {
				id
				identityId
				number
				name
				custodianId
				holdings {
					nodes {
						assetId
						amount
					}
				}
			}
			totalCount
		}
	}
`;

/**
 * Get checkpoints for an asset
 */
export const GET_CHECKPOINTS = gql`
	query GetCheckpoints($ticker: String!, $first: Int, $offset: Int) {
		checkpoints(
			filter: { assetId: { equalTo: $ticker } }
			first: $first
			offset: $offset
			orderBy: CREATED_BLOCK_ID_DESC
		) {
			nodes {
				id
				assetId
				totalSupply
				createdBlock {
					blockId
					datetime
				}
			}
			totalCount
		}
	}
`;

/**
 * Get governance proposals (PIPs)
 */
export const GET_PIPS = gql`
	query GetPIPs($first: Int, $offset: Int) {
		proposals(
			first: $first
			offset: $offset
			orderBy: CREATED_BLOCK_ID_DESC
		) {
			nodes {
				id
				proposer
				state
				balance
				url
				description
				snapshotted
				totalAyeWeight
				totalNayWeight
				createdBlock {
					blockId
					datetime
				}
			}
			totalCount
		}
	}
`;

/**
 * Execute a custom GraphQL query
 */
export async function executeQuery<T>(
	client: MiddlewareClient,
	query: string,
	variables?: Record<string, unknown>,
): Promise<T> {
	return client.request<T>(query, variables);
}
