import type { INodeProperties } from 'n8n-workflow';
import { ASSET_TYPE_OPTIONS, IDENTIFIER_TYPE_OPTIONS, DOCUMENT_TYPE_OPTIONS } from '../../constants/assetIdentifiers';

export const assetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['asset'],
			},
		},
		options: [
			{ name: 'Add Asset Identifier', value: 'addAssetIdentifier', description: 'Add identifier (ISIN, CUSIP, etc.)', action: 'Add asset identifier' },
			{ name: 'Add Document', value: 'addDocument', description: 'Add document to asset', action: 'Add document' },
			{ name: 'Controller Transfer', value: 'controllerTransfer', description: 'Force transfer tokens (controller only)', action: 'Controller transfer' },
			{ name: 'Create Asset', value: 'createAsset', description: 'Create a new security token', action: 'Create asset' },
			{ name: 'Freeze Asset', value: 'freezeAsset', description: 'Freeze all transfers', action: 'Freeze asset' },
			{ name: 'Get Asset', value: 'getAsset', description: 'Get asset details by ticker', action: 'Get asset' },
			{ name: 'Get Asset Compliance', value: 'getAssetCompliance', description: 'Get compliance requirements', action: 'Get asset compliance' },
			{ name: 'Get Asset Documents', value: 'getAssetDocuments', description: 'Get asset documents', action: 'Get asset documents' },
			{ name: 'Get Asset Holders', value: 'getAssetHolders', description: 'Get list of token holders', action: 'Get asset holders' },
			{ name: 'Get Asset Identifiers', value: 'getAssetIdentifiers', description: 'Get identifiers (ISIN, CUSIP, etc.)', action: 'Get asset identifiers' },
			{ name: 'Get Asset Issuance', value: 'getAssetIssuance', description: 'Get issuance information', action: 'Get asset issuance' },
			{ name: 'Get Asset Metadata', value: 'getAssetMetadata', description: 'Get asset metadata entries', action: 'Get asset metadata' },
			{ name: 'Get Asset Statistics', value: 'getAssetStatistics', description: 'Get transfer statistics', action: 'Get asset statistics' },
			{ name: 'Issue Tokens', value: 'issueTokens', description: 'Issue new tokens', action: 'Issue tokens' },
			{ name: 'Make Divisible', value: 'makeDivisible', description: 'Make asset divisible', action: 'Make divisible' },
			{ name: 'Redeem Tokens', value: 'redeemTokens', description: 'Redeem (burn) tokens', action: 'Redeem tokens' },
			{ name: 'Remove Document', value: 'removeDocument', description: 'Remove document from asset', action: 'Remove document' },
			{ name: 'Rename Asset', value: 'renameAsset', description: 'Change asset name', action: 'Rename asset' },
			{ name: 'Set Asset Metadata', value: 'setAssetMetadata', description: 'Set metadata value', action: 'Set asset metadata' },
			{ name: 'Unfreeze Asset', value: 'unfreezeAsset', description: 'Unfreeze transfers', action: 'Unfreeze asset' },
		],
		default: 'getAsset',
	},
];

export const assetFields: INodeProperties[] = [
	// Ticker field (used by most operations)
	{
		displayName: 'Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'ACME',
		description: 'Asset ticker symbol (1-12 uppercase alphanumeric)',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: [
					'getAsset', 'getAssetDocuments', 'getAssetCompliance', 'getAssetHolders',
					'getAssetIssuance', 'issueTokens', 'redeemTokens', 'freezeAsset', 'unfreezeAsset',
					'addDocument', 'removeDocument', 'getAssetMetadata', 'setAssetMetadata',
					'getAssetIdentifiers', 'addAssetIdentifier', 'controllerTransfer',
					'makeDivisible', 'renameAsset', 'getAssetStatistics',
				],
			},
		},
	},

	// Create Asset fields
	{
		displayName: 'Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'ACME',
		description: 'Ticker symbol for the new asset',
		displayOptions: {
			show: { resource: ['asset'], operation: ['createAsset'] },
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Acme Corporation Common Stock',
		description: 'Full name of the security token',
		displayOptions: {
			show: { resource: ['asset'], operation: ['createAsset'] },
		},
	},
	{
		displayName: 'Asset Type',
		name: 'assetType',
		type: 'options',
		required: true,
		default: 'EquityCommon',
		options: ASSET_TYPE_OPTIONS,
		description: 'Type of security token',
		displayOptions: {
			show: { resource: ['asset'], operation: ['createAsset'] },
		},
	},
	{
		displayName: 'Divisible',
		name: 'isDivisible',
		type: 'boolean',
		default: true,
		description: 'Whether tokens can be fractionally owned',
		displayOptions: {
			show: { resource: ['asset'], operation: ['createAsset'] },
		},
	},
	{
		displayName: 'Funding Round',
		name: 'fundingRound',
		type: 'string',
		default: '',
		placeholder: 'Series A',
		description: 'Optional funding round name',
		displayOptions: {
			show: { resource: ['asset'], operation: ['createAsset'] },
		},
	},
	{
		displayName: 'Initial Supply',
		name: 'initialSupply',
		type: 'string',
		default: '0',
		placeholder: '1000000',
		description: 'Initial token supply to mint',
		displayOptions: {
			show: { resource: ['asset'], operation: ['createAsset'] },
		},
	},

	// Issue/Redeem amount
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1000000',
		description: 'Number of tokens to issue/redeem',
		displayOptions: {
			show: { resource: ['asset'], operation: ['issueTokens', 'redeemTokens', 'controllerTransfer'] },
		},
	},

	// Redeem from portfolio
	{
		displayName: 'From Portfolio',
		name: 'fromPortfolio',
		type: 'number',
		default: 0,
		description: 'Portfolio ID to redeem from (0 for default)',
		displayOptions: {
			show: { resource: ['asset'], operation: ['redeemTokens'] },
		},
	},

	// Document fields
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Prospectus',
		description: 'Name of the document',
		displayOptions: {
			show: { resource: ['asset'], operation: ['addDocument', 'removeDocument'] },
		},
	},
	{
		displayName: 'Document URI',
		name: 'docUri',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/docs/prospectus.pdf',
		description: 'URL where document is stored',
		displayOptions: {
			show: { resource: ['asset'], operation: ['addDocument'] },
		},
	},
	{
		displayName: 'Document Type',
		name: 'docType',
		type: 'options',
		default: '',
		options: DOCUMENT_TYPE_OPTIONS,
		description: 'Type of document',
		displayOptions: {
			show: { resource: ['asset'], operation: ['addDocument'] },
		},
	},
	{
		displayName: 'Content Hash',
		name: 'contentHash',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'Optional hash of document content for verification',
		displayOptions: {
			show: { resource: ['asset'], operation: ['addDocument'] },
		},
	},

	// Metadata fields
	{
		displayName: 'Metadata Key',
		name: 'metadataKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'description',
		description: 'Metadata key name',
		displayOptions: {
			show: { resource: ['asset'], operation: ['setAssetMetadata'] },
		},
	},
	{
		displayName: 'Metadata Value',
		name: 'metadataValue',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Asset description...',
		description: 'Metadata value',
		displayOptions: {
			show: { resource: ['asset'], operation: ['setAssetMetadata'] },
		},
	},

	// Identifier fields
	{
		displayName: 'Identifier Type',
		name: 'identifierType',
		type: 'options',
		required: true,
		default: 'Isin',
		options: IDENTIFIER_TYPE_OPTIONS,
		description: 'Type of identifier',
		displayOptions: {
			show: { resource: ['asset'], operation: ['addAssetIdentifier'] },
		},
	},
	{
		displayName: 'Identifier Value',
		name: 'identifierValue',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'US0378331005',
		description: 'Identifier value',
		displayOptions: {
			show: { resource: ['asset'], operation: ['addAssetIdentifier'] },
		},
	},

	// Controller transfer
	{
		displayName: 'Origin DID',
		name: 'originDid',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'DID of identity to transfer from',
		displayOptions: {
			show: { resource: ['asset'], operation: ['controllerTransfer'] },
		},
	},

	// Rename
	{
		displayName: 'New Name',
		name: 'newName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'New Asset Name',
		description: 'New name for the asset',
		displayOptions: {
			show: { resource: ['asset'], operation: ['renameAsset'] },
		},
	},

	// Holders limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Maximum number of holders to return',
		displayOptions: {
			show: { resource: ['asset'], operation: ['getAssetHolders'] },
		},
	},
];
