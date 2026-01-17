/**
 * Polymesh Compliance Utilities
 * 
 * Helper functions for working with Polymesh compliance rules.
 */

import { CONDITION_TYPES, COMPLIANCE_TEMPLATES, ComplianceRequirement } from '../constants/complianceTypes';
import { CLAIM_TYPES } from '../constants/claimTypes';

// Compliance check result
export interface ComplianceCheckResult {
	compliant: boolean;
	requirements: RequirementResult[];
	blockedReasons: string[];
}

// Individual requirement result
export interface RequirementResult {
	id: number;
	met: boolean;
	senderConditionsMet: boolean;
	receiverConditionsMet: boolean;
	failedConditions: string[];
}

// Transfer compliance params
export interface TransferComplianceParams {
	ticker: string;
	sender: string;
	receiver: string;
	amount: string;
}

/**
 * Get a compliance template by name
 */
export function getComplianceTemplate(templateName: string): typeof COMPLIANCE_TEMPLATES[keyof typeof COMPLIANCE_TEMPLATES] | null {
	const template = COMPLIANCE_TEMPLATES[templateName as keyof typeof COMPLIANCE_TEMPLATES];
	return template || null;
}

/**
 * Build compliance requirements from template
 */
export function buildComplianceFromTemplate(templateName: string): ComplianceRequirement[] {
	const template = getComplianceTemplate(templateName);
	if (!template) {
		throw new Error(`Unknown compliance template: ${templateName}`);
	}
	
	return template.requirements.map((req, index) => ({
		id: index + 1,
		senderConditions: req.senderConditions.map((c) => ({
			type: c.type as keyof typeof CONDITION_TYPES,
			claim: c.claim,
			trustedIssuers: c.trustedIssuers,
		})),
		receiverConditions: req.receiverConditions.map((c) => ({
			type: c.type as keyof typeof CONDITION_TYPES,
			claim: c.claim,
			trustedIssuers: c.trustedIssuers,
		})),
	}));
}

/**
 * Build a simple CDD-only compliance requirement
 */
export function buildCddOnlyCompliance(): ComplianceRequirement {
	return {
		id: 1,
		senderConditions: [
			{
				type: 'IsPresent',
				claim: { type: CLAIM_TYPES.CustomerDueDiligence },
			},
		],
		receiverConditions: [
			{
				type: 'IsPresent',
				claim: { type: CLAIM_TYPES.CustomerDueDiligence },
			},
		],
	};
}

/**
 * Build an accredited investor requirement
 */
export function buildAccreditedCompliance(jurisdiction?: string): ComplianceRequirement {
	const receiverConditions: ComplianceRequirement['receiverConditions'] = [
		{
			type: 'IsPresent',
			claim: { type: CLAIM_TYPES.CustomerDueDiligence },
		},
		{
			type: 'IsPresent',
			claim: { type: CLAIM_TYPES.Accredited },
		},
	];
	
	if (jurisdiction) {
		receiverConditions.push({
			type: 'IsPresent',
			claim: {
				type: CLAIM_TYPES.Jurisdiction,
				scope: { type: 'Identity', value: jurisdiction },
			},
		});
	}
	
	return {
		id: 1,
		senderConditions: [
			{
				type: 'IsPresent',
				claim: { type: CLAIM_TYPES.CustomerDueDiligence },
			},
		],
		receiverConditions,
	};
}

/**
 * Build a jurisdiction blocked requirement
 */
export function buildJurisdictionBlockedCompliance(
	blockedJurisdictions: string[],
): ComplianceRequirement {
	return {
		id: 1,
		senderConditions: [
			{
				type: 'IsPresent',
				claim: { type: CLAIM_TYPES.CustomerDueDiligence },
			},
		],
		receiverConditions: [
			{
				type: 'IsPresent',
				claim: { type: CLAIM_TYPES.CustomerDueDiligence },
			},
			...blockedJurisdictions.map((j) => ({
				type: 'IsAbsent' as const,
				claim: {
					type: CLAIM_TYPES.Jurisdiction,
					scope: { type: 'Identity' as const, value: j },
				},
			})),
		],
	};
}

/**
 * Parse compliance result from SDK
 */
export function parseComplianceResult(result: unknown): ComplianceCheckResult {
	const defaultResult: ComplianceCheckResult = {
		compliant: false,
		requirements: [],
		blockedReasons: [],
	};
	
	if (!result || typeof result !== 'object') {
		return defaultResult;
	}
	
	const r = result as Record<string, unknown>;
	
	return {
		compliant: Boolean(r.compliant),
		requirements: Array.isArray(r.requirements) 
			? r.requirements.map((req: unknown, index: number) => parseRequirementResult(req, index + 1))
			: [],
		blockedReasons: Array.isArray(r.blockedReasons) ? r.blockedReasons as string[] : [],
	};
}

/**
 * Parse individual requirement result
 */
function parseRequirementResult(result: unknown, id: number): RequirementResult {
	if (!result || typeof result !== 'object') {
		return {
			id,
			met: false,
			senderConditionsMet: false,
			receiverConditionsMet: false,
			failedConditions: [],
		};
	}
	
	const r = result as Record<string, unknown>;
	
	return {
		id,
		met: Boolean(r.met),
		senderConditionsMet: Boolean(r.senderConditionsMet),
		receiverConditionsMet: Boolean(r.receiverConditionsMet),
		failedConditions: Array.isArray(r.failedConditions) ? r.failedConditions as string[] : [],
	};
}

/**
 * Format compliance requirements for display
 */
export function formatComplianceForDisplay(requirements: ComplianceRequirement[]): string {
	return requirements.map((req) => {
		const senderConds = req.senderConditions.map(formatCondition).join(' AND ');
		const receiverConds = req.receiverConditions.map(formatCondition).join(' AND ');
		
		return `Requirement ${req.id}:\n  Sender: ${senderConds}\n  Receiver: ${receiverConds}`;
	}).join('\n\n');
}

/**
 * Format a single condition for display
 */
function formatCondition(condition: ComplianceRequirement['senderConditions'][0]): string {
	let str = condition.type;
	
	if (condition.claim) {
		str += ` [${condition.claim.type}`;
		if (condition.claim.scope) {
			str += ` @ ${condition.claim.scope.type}:${condition.claim.scope.value}`;
		}
		str += ']';
	}
	
	if (condition.identity) {
		str += ` (${condition.identity})`;
	}
	
	return str;
}

/**
 * Check if compliance requirements include accredited investor
 */
export function requiresAccreditedInvestor(requirements: ComplianceRequirement[]): boolean {
	return requirements.some((req) =>
		req.receiverConditions.some(
			(cond) => cond.type === 'IsPresent' && cond.claim?.type === CLAIM_TYPES.Accredited
		)
	);
}

/**
 * Get blocked jurisdictions from requirements
 */
export function getBlockedJurisdictions(requirements: ComplianceRequirement[]): string[] {
	const blocked: string[] = [];
	
	for (const req of requirements) {
		for (const cond of req.receiverConditions) {
			if (
				cond.type === 'IsAbsent' &&
				cond.claim?.type === CLAIM_TYPES.Jurisdiction &&
				cond.claim.scope?.value
			) {
				blocked.push(cond.claim.scope.value);
			}
		}
	}
	
	return [...new Set(blocked)];
}

/**
 * Validate compliance requirement structure
 */
export function validateComplianceRequirement(req: unknown): req is ComplianceRequirement {
	if (!req || typeof req !== 'object') {
		return false;
	}
	
	const r = req as Record<string, unknown>;
	
	return (
		typeof r.id === 'number' &&
		Array.isArray(r.senderConditions) &&
		Array.isArray(r.receiverConditions)
	);
}
