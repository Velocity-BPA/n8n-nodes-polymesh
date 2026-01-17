import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Accept Authorization',
				value: 'acceptAuthorization',
				description: 'Accept a pending authorization',
				action: 'Accept authorization',
			},
			{
				name: 'Get Account Identity',
				value: 'getAccountIdentity',
				description: 'Get the identity (DID) linked to an account',
				action: 'Get account identity',
			},
			{
				name: 'Get Account Permissions',
				value: 'getAccountPermissions',
				description: 'Get permissions for a secondary key account',
				action: 'Get account permissions',
			},
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get POLYX balance for an account',
				action: 'Get balance',
			},
			{
				name: 'Get Multi-Sig Info',
				value: 'getMultiSigInfo',
				description: 'Get multi-signature account information',
				action: 'Get multi-sig info',
			},
			{
				name: 'Get My Balance',
				value: 'getMyBalance',
				description: 'Get POLYX balance for signing account',
				action: 'Get my balance',
			},
			{
				name: 'Get Pending Authorizations',
				value: 'getPendingAuthorizations',
				description: 'Get pending authorizations for an account',
				action: 'Get pending authorizations',
			},
			{
				name: 'Get Subsidizer Info',
				value: 'getSubsidizerInfo',
				description: 'Get transaction subsidizer information',
				action: 'Get subsidizer info',
			},
			{
				name: 'Get Transaction History',
				value: 'getTransactionHistory',
				description: 'Get transaction history for an account',
				action: 'Get transaction history',
			},
			{
				name: 'Reject Authorization',
				value: 'rejectAuthorization',
				description: 'Reject a pending authorization',
				action: 'Reject authorization',
			},
			{
				name: 'Transfer POLYX',
				value: 'transferPolyx',
				description: 'Transfer POLYX to another account',
				action: 'Transfer POLYX',
			},
			{
				name: 'Validate Address',
				value: 'validateAddress',
				description: 'Validate a Polymesh address format',
				action: 'Validate address',
			},
		],
		default: 'getBalance',
	},
];

export const accountFields: INodeProperties[] = [
	// Address field for most operations
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2DAwNbcQgv...',
		description: 'Polymesh account address (SS58 format)',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'getBalance',
					'getAccountIdentity',
					'getAccountPermissions',
					'getSubsidizerInfo',
					'getTransactionHistory',
					'getPendingAuthorizations',
					'getMultiSigInfo',
					'validateAddress',
				],
			},
		},
	},

	// Transfer POLYX fields
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2DAwNbcQgv...',
		description: 'Recipient Polymesh address',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['transferPolyx'],
			},
		},
	},
	{
		displayName: 'Amount (POLYX)',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '100.5',
		description: 'Amount of POLYX to transfer (e.g., 100.5)',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['transferPolyx'],
			},
		},
	},
	{
		displayName: 'Memo',
		name: 'memo',
		type: 'string',
		default: '',
		placeholder: 'Payment for services',
		description: 'Optional memo to include with the transfer',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['transferPolyx'],
			},
		},
	},

	// Transaction history limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 25,
		description: 'Maximum number of transactions to return',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getTransactionHistory'],
			},
		},
	},

	// Authorization type filter
	{
		displayName: 'Authorization Type',
		name: 'authType',
		type: 'options',
		default: 'all',
		description: 'Filter authorizations by type',
		options: [
			{ name: 'All Types', value: 'all' },
			{ name: 'Add MultiSig Signer', value: 'AddMultiSigSigner' },
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
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getPendingAuthorizations'],
			},
		},
	},

	// Authorization ID
	{
		displayName: 'Authorization ID',
		name: 'authId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345',
		description: 'The authorization ID to accept or reject',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['acceptAuthorization', 'rejectAuthorization'],
			},
		},
	},
];
