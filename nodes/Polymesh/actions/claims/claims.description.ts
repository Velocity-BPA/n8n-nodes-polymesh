import type { INodeProperties } from 'n8n-workflow';
import { CLAIM_TYPE_OPTIONS, SCOPE_TYPE_OPTIONS } from '../../constants/claimTypes';

export const claimsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['claims'] } },
		options: [
			{ name: 'Add Claim', value: 'addClaim', description: 'Add claim to identity', action: 'Add claim' },
			{ name: 'Get Accredited Claims', value: 'getAccreditedClaims', description: 'Get accredited investor claims', action: 'Get accredited claims' },
			{ name: 'Get CDD Claims', value: 'getCddClaims', description: 'Get CDD verification claims', action: 'Get CDD claims' },
			{ name: 'Get Claim Scopes', value: 'getClaimScopes', description: 'Get claim scopes for identity', action: 'Get claim scopes' },
			{ name: 'Get Claims', value: 'getClaims', description: 'Get claims for identity', action: 'Get claims' },
			{ name: 'Get Claims by Issuer', value: 'getClaimsByIssuer', description: 'Get claims issued by identity', action: 'Get claims by issuer' },
			{ name: 'Get Jurisdiction Claims', value: 'getJurisdictionClaims', description: 'Get jurisdiction claims', action: 'Get jurisdiction claims' },
			{ name: 'Get My Claims', value: 'getMyClaims', description: 'Get claims for signing identity', action: 'Get my claims' },
			{ name: 'Revoke Claim', value: 'revokeClaim', description: 'Revoke a claim', action: 'Revoke claim' },
		],
		default: 'getClaims',
	},
];

export const claimsFields: INodeProperties[] = [
	{
		displayName: 'DID',
		name: 'did',
		type: 'string',
		required: true,
		default: '',
		description: 'Identity DID',
		displayOptions: {
			show: { resource: ['claims'], operation: ['getClaims', 'getCddClaims', 'getAccreditedClaims', 'getJurisdictionClaims', 'getClaimScopes'] },
		},
	},
	{
		displayName: 'Target DID',
		name: 'targetDid',
		type: 'string',
		required: true,
		default: '',
		description: 'Target identity DID',
		displayOptions: {
			show: { resource: ['claims'], operation: ['addClaim', 'revokeClaim'] },
		},
	},
	{
		displayName: 'Issuer DID',
		name: 'issuerDid',
		type: 'string',
		required: true,
		default: '',
		description: 'Claim issuer DID',
		displayOptions: {
			show: { resource: ['claims'], operation: ['getClaimsByIssuer'] },
		},
	},
	{
		displayName: 'Claim Type',
		name: 'claimType',
		type: 'options',
		default: 'all',
		options: [{ name: 'All Types', value: 'all' }, ...CLAIM_TYPE_OPTIONS],
		description: 'Type of claim',
		displayOptions: {
			show: { resource: ['claims'], operation: ['getClaims', 'getMyClaims'] },
		},
	},
	{
		displayName: 'Claim Type',
		name: 'claimType',
		type: 'options',
		required: true,
		default: 'CustomerDueDiligence',
		options: CLAIM_TYPE_OPTIONS,
		description: 'Type of claim to add/revoke',
		displayOptions: {
			show: { resource: ['claims'], operation: ['addClaim', 'revokeClaim'] },
		},
	},
	{
		displayName: 'Scope Type',
		name: 'scopeType',
		type: 'options',
		default: 'Identity',
		options: SCOPE_TYPE_OPTIONS,
		description: 'Claim scope type',
		displayOptions: {
			show: { resource: ['claims'], operation: ['addClaim', 'revokeClaim'] },
		},
	},
	{
		displayName: 'Scope Value',
		name: 'scopeValue',
		type: 'string',
		default: '',
		description: 'Scope value (ticker or DID)',
		displayOptions: {
			show: { resource: ['claims'], operation: ['addClaim', 'revokeClaim'] },
		},
	},
	{
		displayName: 'Expiry (Days)',
		name: 'expiryDays',
		type: 'number',
		default: 0,
		description: 'Days until expiry (0 for no expiry)',
		displayOptions: {
			show: { resource: ['claims'], operation: ['addClaim'] },
		},
	},
	{
		displayName: 'Include Expired',
		name: 'includeExpired',
		type: 'boolean',
		default: false,
		description: 'Whether to include expired claims',
		displayOptions: {
			show: { resource: ['claims'], operation: ['getClaims'] },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max claims to return',
		displayOptions: {
			show: { resource: ['claims'], operation: ['getClaimsByIssuer'] },
		},
	},
];
