import type { INodeProperties } from 'n8n-workflow';

export const governanceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['governance'] } },
		options: [
			{ name: 'Get Active PIPs', value: 'getActivePips', description: 'Get active improvement proposals', action: 'Get active PIPs' },
			{ name: 'Get Committee Members', value: 'getCommitteeMembers', description: 'Get committee members', action: 'Get committee members' },
			{ name: 'Get Governance Parameters', value: 'getGovernanceParameters', description: 'Get governance settings', action: 'Get governance parameters' },
			{ name: 'Get Historical PIPs', value: 'getHistoricalPips', description: 'Get historical proposals', action: 'Get historical PIPs' },
			{ name: 'Get Network Info', value: 'getNetworkInfo', description: 'Get network information', action: 'Get network info' },
			{ name: 'Get PIP Details', value: 'getPipDetails', description: 'Get proposal details', action: 'Get PIP details' },
			{ name: 'Get Treasury Balance', value: 'getTreasuryBalance', description: 'Get treasury balance', action: 'Get treasury balance' },
			{ name: 'Get Upcoming Upgrades', value: 'getUpcomingUpgrades', description: 'Get scheduled upgrades', action: 'Get upcoming upgrades' },
		],
		default: 'getActivePips',
	},
];

export const governanceFields: INodeProperties[] = [
	{
		displayName: 'PIP ID',
		name: 'pipId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['governance'], operation: ['getPipDetails'] } },
		default: '',
		description: 'The ID of the PIP',
	},
	{
		displayName: 'Committee',
		name: 'committee',
		type: 'options',
		displayOptions: { show: { resource: ['governance'], operation: ['getCommitteeMembers'] } },
		options: [
			{ name: 'Technical Committee', value: 'technical' },
			{ name: 'Upgrade Committee', value: 'upgrade' },
		],
		default: 'technical',
		description: 'The committee to query',
	},
	{
		displayName: 'PIP Status',
		name: 'pipStatus',
		type: 'options',
		displayOptions: { show: { resource: ['governance'], operation: ['getHistoricalPips'] } },
		options: [
			{ name: 'All', value: '' },
			{ name: 'Pending', value: 'Pending' },
			{ name: 'Approved', value: 'Approved' },
			{ name: 'Rejected', value: 'Rejected' },
			{ name: 'Executed', value: 'Executed' },
			{ name: 'Expired', value: 'Expired' },
		],
		default: '',
		description: 'Filter by PIP status',
	},
];
