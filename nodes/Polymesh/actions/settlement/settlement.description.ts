import type { INodeProperties } from 'n8n-workflow';
import { VENUE_TYPE_OPTIONS } from '../../utils/settlementUtils';

export const settlementOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['settlement'] } },
		options: [
			{ name: 'Add Instruction', value: 'addInstruction', description: 'Create settlement instruction', action: 'Add instruction' },
			{ name: 'Affirm Instruction', value: 'affirmInstruction', description: 'Affirm a settlement instruction', action: 'Affirm instruction' },
			{ name: 'Create Venue', value: 'createVenue', description: 'Create a settlement venue', action: 'Create venue' },
			{ name: 'Execute Instruction', value: 'executeInstruction', description: 'Execute instruction manually', action: 'Execute instruction' },
			{ name: 'Get Instruction', value: 'getInstruction', description: 'Get instruction details', action: 'Get instruction' },
			{ name: 'Get Instruction Affirmations', value: 'getInstructionAffirmations', description: 'Get instruction affirmations', action: 'Get instruction affirmations' },
			{ name: 'Get Instruction Legs', value: 'getInstructionLegs', description: 'Get instruction settlement legs', action: 'Get instruction legs' },
			{ name: 'Get My Venues', value: 'getMyVenues', description: 'Get venues owned by signing identity', action: 'Get my venues' },
			{ name: 'Get Pending Instructions', value: 'getPendingInstructions', description: 'Get pending instructions', action: 'Get pending instructions' },
			{ name: 'Get Venue', value: 'getVenue', description: 'Get venue details', action: 'Get venue' },
			{ name: 'Get Venue Instructions', value: 'getVenueInstructions', description: 'Get instructions in venue', action: 'Get venue instructions' },
			{ name: 'Reject Instruction', value: 'rejectInstruction', description: 'Reject instruction', action: 'Reject instruction' },
			{ name: 'Withdraw Affirmation', value: 'withdrawAffirmation', description: 'Withdraw affirmation', action: 'Withdraw affirmation' },
		],
		default: 'getVenue',
	},
];

export const settlementFields: INodeProperties[] = [
	{
		displayName: 'Venue ID',
		name: 'venueId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1',
		description: 'Settlement venue ID',
		displayOptions: {
			show: { resource: ['settlement'], operation: ['getVenue', 'getVenueInstructions', 'addInstruction'] },
		},
	},
	{
		displayName: 'Instruction ID',
		name: 'instructionId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345',
		description: 'Settlement instruction ID',
		displayOptions: {
			show: { resource: ['settlement'], operation: ['getInstruction', 'getInstructionLegs', 'affirmInstruction', 'withdrawAffirmation', 'rejectInstruction', 'executeInstruction', 'getInstructionAffirmations'] },
		},
	},
	{
		displayName: 'Venue Type',
		name: 'venueType',
		type: 'options',
		required: true,
		default: 'Distribution',
		options: VENUE_TYPE_OPTIONS,
		description: 'Type of settlement venue',
		displayOptions: {
			show: { resource: ['settlement'], operation: ['createVenue'] },
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		placeholder: 'Primary trading venue',
		description: 'Venue description',
		displayOptions: {
			show: { resource: ['settlement'], operation: ['createVenue'] },
		},
	},
	{
		displayName: 'Settlement Legs',
		name: 'legs',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		description: 'Settlement instruction legs',
		displayOptions: {
			show: { resource: ['settlement'], operation: ['addInstruction'] },
		},
		options: [
			{
				name: 'leg',
				displayName: 'Leg',
				values: [
					{ displayName: 'From DID', name: 'fromDid', type: 'string', default: '', description: 'Sender identity DID' },
					{ displayName: 'From Portfolio', name: 'fromPortfolio', type: 'string', default: '0', description: 'Sender portfolio ID (0 for default)' },
					{ displayName: 'To DID', name: 'toDid', type: 'string', default: '', description: 'Receiver identity DID' },
					{ displayName: 'To Portfolio', name: 'toPortfolio', type: 'string', default: '0', description: 'Receiver portfolio ID (0 for default)' },
					{ displayName: 'Ticker', name: 'ticker', type: 'string', default: '', description: 'Asset ticker' },
					{ displayName: 'Amount', name: 'amount', type: 'string', default: '', description: 'Amount to transfer' },
				],
			},
		],
	},
];
