import type { INodeProperties } from 'n8n-workflow';

export const externalAgentsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['externalAgents'] } },
		options: [
			{ name: 'Abdicate Agent Role', value: 'abdicateAgentRole', description: 'Give up agent role', action: 'Abdicate agent role' },
			{ name: 'Create Custom Group', value: 'createCustomGroup', description: 'Create custom permission group', action: 'Create custom group' },
			{ name: 'Get Agent Groups', value: 'getAgentGroups', description: 'Get permission groups', action: 'Get agent groups' },
			{ name: 'Get External Agents', value: 'getExternalAgents', description: 'Get all external agents', action: 'Get external agents' },
			{ name: 'Invite External Agent', value: 'inviteExternalAgent', description: 'Invite identity as agent', action: 'Invite external agent' },
			{ name: 'Remove External Agent', value: 'removeExternalAgent', description: 'Remove an external agent', action: 'Remove external agent' },
			{ name: 'Set Group Permissions', value: 'setGroupPermissions', description: 'Update group permissions', action: 'Set group permissions' },
		],
		default: 'getExternalAgents',
	},
];

export const externalAgentsFields: INodeProperties[] = [
	{
		displayName: 'Asset Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['externalAgents'] } },
		default: '',
		description: 'The ticker symbol of the asset',
	},
	{
		displayName: 'Target DID',
		name: 'targetDid',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['externalAgents'], operation: ['inviteExternalAgent'] } },
		default: '',
		description: 'DID of the identity to invite',
	},
	{
		displayName: 'Agent DID',
		name: 'agentDid',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['externalAgents'], operation: ['removeExternalAgent'] } },
		default: '',
		description: 'DID of the agent to remove',
	},
	{
		displayName: 'Permission Group',
		name: 'permissionGroup',
		type: 'options',
		required: true,
		displayOptions: { show: { resource: ['externalAgents'], operation: ['inviteExternalAgent'] } },
		options: [
			{ name: 'Full', value: 'Full', description: 'Full permissions' },
			{ name: 'Except Meta', value: 'ExceptMeta', description: 'All except metadata changes' },
			{ name: 'Corporate Actions Agent', value: 'PolymeshV1CAA', description: 'Corporate actions permissions' },
			{ name: 'Primary Issuance Agent', value: 'PolymeshV1PIA', description: 'Issuance permissions' },
		],
		default: 'Full',
		description: 'Permission group for the agent',
	},
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['externalAgents'], operation: ['setGroupPermissions'] } },
		default: '',
		description: 'Custom group ID to update',
	},
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { resource: ['externalAgents'], operation: ['createCustomGroup', 'setGroupPermissions'] } },
		default: {},
		options: [
			{
				name: 'permissionValues',
				displayName: 'Permission',
				values: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Asset - Issue', value: 'Asset.issue' },
							{ name: 'Asset - Redeem', value: 'Asset.redeem' },
							{ name: 'Asset - Controller Transfer', value: 'Asset.controllerTransfer' },
							{ name: 'Compliance - Add Rule', value: 'ComplianceManager.addComplianceRequirement' },
							{ name: 'Compliance - Remove Rule', value: 'ComplianceManager.removeComplianceRequirement' },
							{ name: 'Corporate Actions - Initiate', value: 'CorporateAction.initiateCorporateAction' },
							{ name: 'Checkpoint - Create', value: 'Checkpoint.createCheckpoint' },
							{ name: 'Statistics - Set Transfer Restrictions', value: 'Statistics.setTransferRestriction' },
						],
						default: 'Asset.issue',
					},
				],
			},
		],
		description: 'Transaction permissions to grant',
	},
];
