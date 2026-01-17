import type { INodeProperties } from 'n8n-workflow';
import { CLAIM_TYPE_OPTIONS } from '../../constants/claimTypes';
import { COMPLIANCE_TEMPLATE_OPTIONS } from '../../constants/complianceTypes';

export const complianceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['compliance'] } },
		options: [
			{ name: 'Add Requirement', value: 'addRequirement', description: 'Add compliance requirement', action: 'Add requirement' },
			{ name: 'Add Trusted Claim Issuer', value: 'addTrustedClaimIssuer', description: 'Add trusted issuer', action: 'Add trusted claim issuer' },
			{ name: 'Apply Template', value: 'applyTemplate', description: 'Apply pre-built compliance template', action: 'Apply template' },
			{ name: 'Get Requirements', value: 'getRequirements', description: 'Get compliance requirements', action: 'Get requirements' },
			{ name: 'Get Trusted Claim Issuers', value: 'getTrustedClaimIssuers', description: 'Get trusted issuers', action: 'Get trusted claim issuers' },
			{ name: 'Pause Compliance', value: 'pauseCompliance', description: 'Pause compliance checks', action: 'Pause compliance' },
			{ name: 'Remove Requirement', value: 'removeRequirement', description: 'Remove compliance requirement', action: 'Remove requirement' },
			{ name: 'Remove Trusted Claim Issuer', value: 'removeTrustedClaimIssuer', description: 'Remove trusted issuer', action: 'Remove trusted claim issuer' },
			{ name: 'Reset Compliance', value: 'resetCompliance', description: 'Reset all requirements', action: 'Reset compliance' },
			{ name: 'Resume Compliance', value: 'resumeCompliance', description: 'Resume compliance checks', action: 'Resume compliance' },
			{ name: 'Validate Transfer', value: 'validateTransfer', description: 'Check if transfer is compliant', action: 'Validate transfer' },
		],
		default: 'getRequirements',
	},
];

export const complianceFields: INodeProperties[] = [
	{
		displayName: 'Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		default: '',
		description: 'Asset ticker',
		displayOptions: {
			show: { resource: ['compliance'] },
		},
	},
	{
		displayName: 'Requirement ID',
		name: 'requirementId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Requirement index to remove',
		displayOptions: {
			show: { resource: ['compliance'], operation: ['removeRequirement'] },
		},
	},
	{
		displayName: 'Issuer DID',
		name: 'issuerDid',
		type: 'string',
		required: true,
		default: '',
		description: 'Trusted claim issuer DID',
		displayOptions: {
			show: { resource: ['compliance'], operation: ['addTrustedClaimIssuer', 'removeTrustedClaimIssuer'] },
		},
	},
	{
		displayName: 'Trusted For',
		name: 'trustedFor',
		type: 'multiOptions',
		default: [],
		options: CLAIM_TYPE_OPTIONS,
		description: 'Claim types issuer is trusted for',
		displayOptions: {
			show: { resource: ['compliance'], operation: ['addTrustedClaimIssuer'] },
		},
	},
	{
		displayName: 'From DID',
		name: 'fromDid',
		type: 'string',
		required: true,
		default: '',
		description: 'Sender identity DID',
		displayOptions: {
			show: { resource: ['compliance'], operation: ['validateTransfer'] },
		},
	},
	{
		displayName: 'To DID',
		name: 'toDid',
		type: 'string',
		required: true,
		default: '',
		description: 'Receiver identity DID',
		displayOptions: {
			show: { resource: ['compliance'], operation: ['validateTransfer'] },
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '1',
		description: 'Transfer amount',
		displayOptions: {
			show: { resource: ['compliance'], operation: ['validateTransfer'] },
		},
	},
	{
		displayName: 'Template',
		name: 'template',
		type: 'options',
		required: true,
		default: 'kycOnly',
		options: COMPLIANCE_TEMPLATE_OPTIONS,
		description: 'Pre-built compliance template',
		displayOptions: {
			show: { resource: ['compliance'], operation: ['applyTemplate'] },
		},
	},
	{
		displayName: 'Conditions',
		name: 'conditions',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		description: 'Compliance conditions',
		displayOptions: {
			show: { resource: ['compliance'], operation: ['addRequirement'] },
		},
		options: [
			{
				name: 'condition',
				displayName: 'Condition',
				values: [
					{ displayName: 'Type', name: 'type', type: 'options', default: 'IsPresent', options: [
						{ name: 'Is Present', value: 'IsPresent' },
						{ name: 'Is Absent', value: 'IsAbsent' },
						{ name: 'Is Any Of', value: 'IsAnyOf' },
						{ name: 'Is None Of', value: 'IsNoneOf' },
					]},
					{ displayName: 'Target', name: 'target', type: 'options', default: 'Receiver', options: [
						{ name: 'Sender', value: 'Sender' },
						{ name: 'Receiver', value: 'Receiver' },
						{ name: 'Both', value: 'Both' },
					]},
					{ displayName: 'Claim Type', name: 'claimType', type: 'options', default: 'CustomerDueDiligence', options: CLAIM_TYPE_OPTIONS },
				],
			},
		],
	},
];
