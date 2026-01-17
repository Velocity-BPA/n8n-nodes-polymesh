/**
 * Polymesh Compliance Types
 * 
 * Compliance rules are enforced at the protocol level to ensure
 * all security token transfers meet regulatory requirements.
 */

// Compliance condition types
export const CONDITION_TYPES = {
	// Identity-based conditions
	IsPresent: 'IsPresent',
	IsAbsent: 'IsAbsent',
	IsAnyOf: 'IsAnyOf',
	IsNoneOf: 'IsNoneOf',
	IsIdentity: 'IsIdentity',
	IsExternalAgent: 'IsExternalAgent',
} as const;

export type ConditionType = keyof typeof CONDITION_TYPES;

// Compliance targets (sender/receiver)
export const CONDITION_TARGETS = {
	Sender: 'Sender',
	Receiver: 'Receiver',
	Both: 'Both',
} as const;

export type ConditionTarget = keyof typeof CONDITION_TARGETS;

// Compliance requirement structure
export interface ComplianceRequirement {
	id: number;
	senderConditions: ComplianceCondition[];
	receiverConditions: ComplianceCondition[];
}

export interface ComplianceCondition {
	type: ConditionType;
	claim?: {
		type: string;
		scope?: {
			type: string;
			value: string;
		};
	};
	trustedIssuers?: string[];
	identity?: string;
}

// Pre-defined compliance templates
export const COMPLIANCE_TEMPLATES = {
	// US Reg D 506(c) - Accredited investors only
	regD506c: {
		name: 'US Reg D 506(c)',
		description: 'Accredited investors only, US jurisdiction',
		requirements: [
			{
				senderConditions: [
					{ type: 'IsPresent', claim: { type: 'CustomerDueDiligence' } },
				],
				receiverConditions: [
					{ type: 'IsPresent', claim: { type: 'CustomerDueDiligence' } },
					{ type: 'IsPresent', claim: { type: 'Accredited' } },
					{ type: 'IsPresent', claim: { type: 'Jurisdiction', scope: { type: 'Identity', value: 'US' } } },
				],
			},
		],
	},

	// EU Reg S - Non-US investors
	regS: {
		name: 'EU Reg S',
		description: 'Non-US investors',
		requirements: [
			{
				senderConditions: [
					{ type: 'IsPresent', claim: { type: 'CustomerDueDiligence' } },
				],
				receiverConditions: [
					{ type: 'IsPresent', claim: { type: 'CustomerDueDiligence' } },
					{ type: 'IsAbsent', claim: { type: 'Jurisdiction', scope: { type: 'Identity', value: 'US' } } },
				],
			},
		],
	},

	// KYC Only - Basic compliance
	kycOnly: {
		name: 'KYC Only',
		description: 'Basic KYC requirement for all transfers',
		requirements: [
			{
				senderConditions: [
					{ type: 'IsPresent', claim: { type: 'CustomerDueDiligence' } },
				],
				receiverConditions: [
					{ type: 'IsPresent', claim: { type: 'CustomerDueDiligence' } },
				],
			},
		],
	},

	// Restricted jurisdictions
	jurisdictionRestricted: {
		name: 'Jurisdiction Restricted',
		description: 'Block specific jurisdictions',
		requirements: [
			{
				senderConditions: [
					{ type: 'IsPresent', claim: { type: 'CustomerDueDiligence' } },
				],
				receiverConditions: [
					{ type: 'IsPresent', claim: { type: 'CustomerDueDiligence' } },
					{ type: 'IsNoneOf', claim: { type: 'Blocked' } },
				],
			},
		],
	},
};

// Condition type options for UI
export const CONDITION_TYPE_OPTIONS = [
	{ name: 'Claim Is Present', value: 'IsPresent' },
	{ name: 'Claim Is Absent', value: 'IsAbsent' },
	{ name: 'Claim Is Any Of', value: 'IsAnyOf' },
	{ name: 'Claim Is None Of', value: 'IsNoneOf' },
	{ name: 'Is Specific Identity', value: 'IsIdentity' },
	{ name: 'Is External Agent', value: 'IsExternalAgent' },
];

// Target options for UI
export const CONDITION_TARGET_OPTIONS = [
	{ name: 'Sender Only', value: 'Sender' },
	{ name: 'Receiver Only', value: 'Receiver' },
	{ name: 'Both Sender and Receiver', value: 'Both' },
];

// Compliance template options for UI
export const COMPLIANCE_TEMPLATE_OPTIONS = [
	{ name: 'US Reg D 506(c) - Accredited Only', value: 'regD506c' },
	{ name: 'EU Reg S - Non-US', value: 'regS' },
	{ name: 'KYC Only - Basic', value: 'kycOnly' },
	{ name: 'Jurisdiction Restricted', value: 'jurisdictionRestricted' },
	{ name: 'Custom', value: 'custom' },
];
