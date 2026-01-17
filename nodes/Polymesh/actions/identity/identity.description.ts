/**
 * Polymesh Identity Description
 * 
 * Node parameter definitions for identity operations.
 */

import { INodeProperties } from 'n8n-workflow';
import { CLAIM_TYPE_OPTIONS } from '../../constants/claimTypes';

// Identity operations list
export const identityOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['identity'],
		},
	},
	options: [
		{
			name: 'Add Secondary Key',
			value: 'addSecondaryKey',
			description: 'Invite an account to become a secondary key',
			action: 'Add secondary key',
		},
		{
			name: 'Freeze Secondary Keys',
			value: 'freezeSecondaryKeys',
			description: 'Freeze all secondary keys for the identity',
			action: 'Freeze secondary keys',
		},
		{
			name: 'Get Identity',
			value: 'getIdentity',
			description: 'Get identity details by DID',
			action: 'Get identity',
		},
		{
			name: 'Get Identity Assets',
			value: 'getIdentityAssets',
			description: 'Get assets owned by an identity',
			action: 'Get identity assets',
		},
		{
			name: 'Get Identity Authorizations',
			value: 'getIdentityAuthorizations',
			description: 'Get pending authorizations for an identity',
			action: 'Get identity authorizations',
		},
		{
			name: 'Get Identity Claims',
			value: 'getIdentityClaims',
			description: 'Get claims for an identity',
			action: 'Get identity claims',
		},
		{
			name: 'Get Identity Portfolios',
			value: 'getIdentityPortfolios',
			description: 'Get portfolios for an identity',
			action: 'Get identity portfolios',
		},
		{
			name: 'Get Identity Roles',
			value: 'getIdentityRoles',
			description: 'Get roles assigned to an identity',
			action: 'Get identity roles',
		},
		{
			name: 'Get Identity Venues',
			value: 'getIdentityVenues',
			description: 'Get settlement venues created by an identity',
			action: 'Get identity venues',
		},
		{
			name: 'Get My Identity',
			value: 'getMyIdentity',
			description: 'Get the signing identity details',
			action: 'Get my identity',
		},
		{
			name: 'Get Secondary Keys',
			value: 'getSecondaryKeys',
			description: 'Get secondary keys for an identity',
			action: 'Get secondary keys',
		},
		{
			name: 'Get Trusted Claim Issuers',
			value: 'getTrustedClaimIssuers',
			description: 'Get trusted claim issuers for an asset',
			action: 'Get trusted claim issuers',
		},
		{
			name: 'Leave Identity',
			value: 'leaveIdentity',
			description: 'Leave an identity as a secondary key',
			action: 'Leave identity',
		},
		{
			name: 'Remove Secondary Key',
			value: 'removeSecondaryKey',
			description: 'Remove a secondary key from the identity',
			action: 'Remove secondary key',
		},
		{
			name: 'Rotate Primary Key',
			value: 'rotatePrimaryKey',
			description: 'Rotate the primary key to a new account',
			action: 'Rotate primary key',
		},
		{
			name: 'Unfreeze Secondary Keys',
			value: 'unfreezeSecondaryKeys',
			description: 'Unfreeze all secondary keys for the identity',
			action: 'Unfreeze secondary keys',
		},
	],
	default: 'getMyIdentity',
};

// Identity fields
export const identityFields: INodeProperties[] = [
	// DID field (used by many operations)
	{
		displayName: 'DID (Identity)',
		name: 'did',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Decentralized Identifier (DID) of the identity. 64 hex characters prefixed with 0x.',
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: [
					'getIdentity',
					'getIdentityClaims',
					'getIdentityAssets',
					'getIdentityPortfolios',
					'getIdentityVenues',
					'getIdentityAuthorizations',
				],
			},
		},
	},
	
	// Optional DID (for getSecondaryKeys, getIdentityRoles)
	{
		displayName: 'DID (Optional)',
		name: 'did',
		type: 'string',
		required: false,
		default: '',
		placeholder: '0x... (leave empty for signing identity)',
		description: 'DID to query. Leave empty to use the signing identity.',
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['getSecondaryKeys', 'getIdentityRoles'],
			},
		},
	},
	
	// Claim type filter
	{
		displayName: 'Claim Type',
		name: 'claimType',
		type: 'options',
		options: [
			{ name: 'All Claims', value: '' },
			...CLAIM_TYPE_OPTIONS,
		],
		default: '',
		description: 'Filter claims by type',
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['getIdentityClaims'],
			},
		},
	},
	
	// Include expired claims
	{
		displayName: 'Include Expired',
		name: 'includeExpired',
		type: 'boolean',
		default: false,
		description: 'Whether to include expired claims in the results',
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['getIdentityClaims'],
			},
		},
	},
	
	// Authorization type filter
	{
		displayName: 'Authorization Type',
		name: 'authorizationType',
		type: 'options',
		options: [
			{ name: 'All Types', value: '' },
			{ name: 'Add Multi-Sig Signer', value: 'AddMultiSigSigner' },
			{ name: 'Add Relayer Paying Key', value: 'AddRelayerPayingKey' },
			{ name: 'Attest Primary Key Rotation', value: 'AttestPrimaryKeyRotation' },
			{ name: 'Become Agent', value: 'BecomeAgent' },
			{ name: 'Join Identity', value: 'JoinIdentity' },
			{ name: 'Portfolio Custody', value: 'PortfolioCustody' },
			{ name: 'Rotate Primary Key', value: 'RotatePrimaryKey' },
			{ name: 'Rotate Primary Key to Secondary', value: 'RotatePrimaryKeyToSecondary' },
			{ name: 'Transfer Asset Ownership', value: 'TransferAssetOwnership' },
			{ name: 'Transfer Ticker', value: 'TransferTicker' },
		],
		default: '',
		description: 'Filter authorizations by type',
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['getIdentityAuthorizations'],
			},
		},
	},
	
	// Target account (for secondary key operations)
	{
		displayName: 'Target Account',
		name: 'targetAccount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5...',
		description: 'SS58 address of the target account',
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['addSecondaryKey', 'removeSecondaryKey', 'rotatePrimaryKey'],
			},
		},
	},
	
	// Permissions for secondary key
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'collection',
		placeholder: 'Add Permission',
		default: {},
		description: 'Permissions to grant to the secondary key',
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['addSecondaryKey'],
			},
		},
		options: [
			{
				displayName: 'Asset Permissions',
				name: 'assets',
				type: 'options',
				options: [
					{ name: 'Full Access', value: 'Whole' },
					{ name: 'Specific Assets', value: 'These' },
					{ name: 'All Except', value: 'Except' },
				],
				default: 'Whole',
				description: 'Asset access level',
			},
			{
				displayName: 'Asset Tickers',
				name: 'assetTickers',
				type: 'string',
				default: '',
				placeholder: 'ACME, STOCK',
				description: 'Comma-separated list of asset tickers (for These/Except)',
			},
			{
				displayName: 'Portfolio Permissions',
				name: 'portfolios',
				type: 'options',
				options: [
					{ name: 'Full Access', value: 'Whole' },
					{ name: 'Specific Portfolios', value: 'These' },
					{ name: 'All Except', value: 'Except' },
				],
				default: 'Whole',
				description: 'Portfolio access level',
			},
			{
				displayName: 'Transaction Permissions',
				name: 'transactions',
				type: 'options',
				options: [
					{ name: 'Full Access', value: 'Whole' },
					{ name: 'Specific Transactions', value: 'These' },
					{ name: 'All Except', value: 'Except' },
				],
				default: 'Whole',
				description: 'Transaction access level',
			},
		],
	},
	
	// Ticker (for getTrustedClaimIssuers)
	{
		displayName: 'Asset Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'ACME',
		description: 'Ticker symbol of the asset (max 12 characters)',
		displayOptions: {
			show: {
				resource: ['identity'],
				operation: ['getTrustedClaimIssuers'],
			},
		},
	},
];
