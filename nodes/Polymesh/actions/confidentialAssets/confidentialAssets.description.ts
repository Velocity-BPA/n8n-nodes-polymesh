import { INodeProperties } from 'n8n-workflow';

export const confidentialAssetsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['confidentialAssets'],
		},
	},
	options: [
		{
			name: 'Affirm Confidential Transaction',
			value: 'affirmConfidentialTransaction',
			description: 'Affirm a confidential transaction',
			action: 'Affirm confidential transaction',
		},
		{
			name: 'Create Confidential Account',
			value: 'createConfidentialAccount',
			description: 'Create a new confidential account',
			action: 'Create confidential account',
		},
		{
			name: 'Create Confidential Asset',
			value: 'createConfidentialAsset',
			description: 'Create a new confidential asset',
			action: 'Create confidential asset',
		},
		{
			name: 'Create Confidential Transaction',
			value: 'createConfidentialTransaction',
			description: 'Create a new confidential transaction',
			action: 'Create confidential transaction',
		},
		{
			name: 'Get Auditors',
			value: 'getAuditors',
			description: 'Get auditors for a confidential asset',
			action: 'Get auditors',
		},
		{
			name: 'Get Confidential Account',
			value: 'getConfidentialAccount',
			description: 'Get confidential account details',
			action: 'Get confidential account',
		},
		{
			name: 'Get Confidential Asset',
			value: 'getConfidentialAsset',
			description: 'Get confidential asset details',
			action: 'Get confidential asset',
		},
		{
			name: 'Get Confidential Balance',
			value: 'getConfidentialBalance',
			description: 'Get encrypted balance for a confidential account',
			action: 'Get confidential balance',
		},
		{
			name: 'Get Confidential Transaction',
			value: 'getConfidentialTransaction',
			description: 'Get confidential transaction details',
			action: 'Get confidential transaction',
		},
		{
			name: 'Get Mediators',
			value: 'getMediators',
			description: 'Get mediators for a confidential asset',
			action: 'Get mediators',
		},
	],
	default: 'getConfidentialAsset',
};

export const confidentialAssetsFields: INodeProperties[] = [
	// Confidential Asset ID
	{
		displayName: 'Confidential Asset ID',
		name: 'confidentialAssetId',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The confidential asset ID',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: [
					'getConfidentialAsset',
					'getAuditors',
					'getMediators',
					'getConfidentialBalance',
				],
			},
		},
		required: true,
	},
	// Confidential Account ID
	{
		displayName: 'Confidential Account ID',
		name: 'confidentialAccountId',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The confidential account public key',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: [
					'getConfidentialAccount',
					'getConfidentialBalance',
				],
			},
		},
		required: true,
	},
	// Transaction ID
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		default: '',
		placeholder: '1',
		description: 'The confidential transaction ID',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: [
					'getConfidentialTransaction',
					'affirmConfidentialTransaction',
				],
			},
		},
		required: true,
	},
	// Create asset fields
	{
		displayName: 'Asset Name',
		name: 'assetName',
		type: 'string',
		default: '',
		placeholder: 'Confidential Token',
		description: 'Name for the confidential asset',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['createConfidentialAsset'],
			},
		},
		required: true,
	},
	{
		displayName: 'Auditors',
		name: 'auditors',
		type: 'string',
		default: '',
		placeholder: '0x..., 0x...',
		description: 'Comma-separated list of auditor public keys',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['createConfidentialAsset'],
			},
		},
	},
	{
		displayName: 'Mediators',
		name: 'mediators',
		type: 'string',
		default: '',
		placeholder: '0x..., 0x...',
		description: 'Comma-separated list of mediator DIDs',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['createConfidentialAsset'],
			},
		},
	},
	// Create transaction fields
	{
		displayName: 'Venue ID',
		name: 'venueId',
		type: 'string',
		default: '',
		placeholder: '1',
		description: 'Settlement venue ID for the transaction',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['createConfidentialTransaction'],
			},
		},
		required: true,
	},
	{
		displayName: 'Sender Account',
		name: 'senderAccount',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'Sender confidential account public key',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['createConfidentialTransaction'],
			},
		},
		required: true,
	},
	{
		displayName: 'Receiver Account',
		name: 'receiverAccount',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'Receiver confidential account public key',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['createConfidentialTransaction'],
			},
		},
		required: true,
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		placeholder: '1000',
		description: 'Amount to transfer (will be encrypted)',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['createConfidentialTransaction'],
			},
		},
		required: true,
	},
	// Affirm transaction fields
	{
		displayName: 'Leg ID',
		name: 'legId',
		type: 'string',
		default: '0',
		placeholder: '0',
		description: 'Leg ID to affirm',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['affirmConfidentialTransaction'],
			},
		},
	},
	{
		displayName: 'Party Type',
		name: 'partyType',
		type: 'options',
		options: [
			{ name: 'Sender', value: 'sender' },
			{ name: 'Receiver', value: 'receiver' },
			{ name: 'Mediator', value: 'mediator' },
		],
		default: 'sender',
		description: 'Role affirming the transaction',
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: ['affirmConfidentialTransaction'],
			},
		},
	},
	// Additional options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['confidentialAssets'],
				operation: [
					'createConfidentialAsset',
					'createConfidentialAccount',
				],
			},
		},
		options: [
			{
				displayName: 'Wait For Confirmation',
				name: 'waitForConfirmation',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for transaction confirmation',
			},
		],
	},
];
