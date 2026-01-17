import type { INodeProperties } from 'n8n-workflow';

export const authorizationsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['authorizations'] } },
		options: [
			{ name: 'Accept Authorization', value: 'acceptAuthorization', description: 'Accept a pending authorization', action: 'Accept authorization' },
			{ name: 'Get Authorization Details', value: 'getAuthorizationDetails', description: 'Get details of an authorization', action: 'Get authorization details' },
			{ name: 'Get Authorization Types', value: 'getAuthorizationTypes', description: 'Get available authorization types', action: 'Get authorization types' },
			{ name: 'Get Pending Authorizations', value: 'getPendingAuthorizations', description: 'Get received authorizations', action: 'Get pending authorizations' },
			{ name: 'Get Sent Authorizations', value: 'getSentAuthorizations', description: 'Get sent authorizations', action: 'Get sent authorizations' },
			{ name: 'Reject Authorization', value: 'rejectAuthorization', description: 'Reject a pending authorization', action: 'Reject authorization' },
			{ name: 'Remove Authorization', value: 'removeAuthorization', description: 'Remove a sent authorization', action: 'Remove authorization' },
		],
		default: 'getPendingAuthorizations',
	},
];

export const authorizationsFields: INodeProperties[] = [
	{
		displayName: 'Identity DID',
		name: 'did',
		type: 'string',
		displayOptions: { show: { resource: ['authorizations'], operation: ['getPendingAuthorizations', 'getSentAuthorizations'] } },
		default: '',
		description: 'The DID to query (leave empty for signing identity)',
	},
	{
		displayName: 'Authorization Type',
		name: 'authorizationType',
		type: 'options',
		displayOptions: { show: { resource: ['authorizations'], operation: ['getPendingAuthorizations'] } },
		options: [
			{ name: 'All', value: '' },
			{ name: 'Add Multi-Sig Signer', value: 'AddMultiSigSigner' },
			{ name: 'Become Agent', value: 'BecomeAgent' },
			{ name: 'Join Identity', value: 'JoinIdentity' },
			{ name: 'Portfolio Custody', value: 'PortfolioCustody' },
			{ name: 'Rotate Primary Key', value: 'RotatePrimaryKey' },
			{ name: 'Transfer Asset Ownership', value: 'TransferAssetOwnership' },
			{ name: 'Transfer Ticker', value: 'TransferTicker' },
		],
		default: '',
		description: 'Filter by authorization type',
	},
	{
		displayName: 'Authorization ID',
		name: 'authorizationId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['authorizations'], operation: ['getAuthorizationDetails', 'acceptAuthorization', 'rejectAuthorization', 'removeAuthorization'] } },
		default: '',
		description: 'The ID of the authorization',
	},
];
