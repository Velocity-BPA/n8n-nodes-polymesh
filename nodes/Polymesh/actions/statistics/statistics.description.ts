import type { INodeProperties } from 'n8n-workflow';

export const statisticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['statistics'] } },
		options: [
			{ name: 'Add Exempted Entity', value: 'addExemptedEntity', description: 'Add exemption from restriction', action: 'Add exempted entity' },
			{ name: 'Get Asset Statistics', value: 'getAssetStatistics', description: 'Get asset statistics overview', action: 'Get asset statistics' },
			{ name: 'Get Balance Statistics', value: 'getBalanceStatistics', description: 'Get holder balance statistics', action: 'Get balance statistics' },
			{ name: 'Get Exempted Entities', value: 'getExemptedEntities', description: 'Get exempted identities', action: 'Get exempted entities' },
			{ name: 'Get Investor Count', value: 'getInvestorCount', description: 'Get number of investors', action: 'Get investor count' },
			{ name: 'Get Transfer Restrictions', value: 'getTransferRestrictions', description: 'Get active restrictions', action: 'Get transfer restrictions' },
			{ name: 'Remove Transfer Restrictions', value: 'removeTransferRestrictions', description: 'Remove all restrictions of type', action: 'Remove transfer restrictions' },
			{ name: 'Set Count Restriction', value: 'setCountRestriction', description: 'Set max investor count', action: 'Set count restriction' },
			{ name: 'Set Percentage Restriction', value: 'setPercentageRestriction', description: 'Set max ownership percentage', action: 'Set percentage restriction' },
		],
		default: 'getAssetStatistics',
	},
];

export const statisticsFields: INodeProperties[] = [
	{
		displayName: 'Asset Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['statistics'] } },
		default: '',
		description: 'The ticker symbol of the asset',
	},
	{
		displayName: 'Restriction Type',
		name: 'restrictionType',
		type: 'options',
		displayOptions: { show: { resource: ['statistics'], operation: ['getTransferRestrictions', 'removeTransferRestrictions', 'getExemptedEntities', 'addExemptedEntity'] } },
		options: [
			{ name: 'Count', value: 'count', description: 'Maximum investor count' },
			{ name: 'Percentage', value: 'percentage', description: 'Maximum ownership percentage' },
			{ name: 'Claim Count', value: 'claimCount', description: 'Count by claim type' },
			{ name: 'Claim Percentage', value: 'claimPercentage', description: 'Percentage by claim type' },
		],
		default: 'count',
		description: 'Type of transfer restriction',
	},
	{
		displayName: 'Count',
		name: 'count',
		type: 'number',
		required: true,
		displayOptions: { show: { resource: ['statistics'], operation: ['setCountRestriction'] } },
		default: 100,
		description: 'Maximum number of investors',
	},
	{
		displayName: 'Percentage',
		name: 'percentage',
		type: 'number',
		required: true,
		displayOptions: { show: { resource: ['statistics'], operation: ['setPercentageRestriction'] } },
		default: 10,
		description: 'Maximum ownership percentage (0-100)',
	},
	{
		displayName: 'Identity DID',
		name: 'did',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['statistics'], operation: ['addExemptedEntity'] } },
		default: '',
		description: 'DID to exempt from restriction',
	},
];
