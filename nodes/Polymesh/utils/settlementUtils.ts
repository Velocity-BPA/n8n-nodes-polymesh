/**
 * Polymesh Settlement Utilities
 * 
 * Helper functions for working with Polymesh settlement instructions.
 */

// Instruction status enum
export enum InstructionStatus {
	Pending = 'Pending',
	Affirmed = 'Affirmed',
	Rejected = 'Rejected',
	Executed = 'Executed',
	Failed = 'Failed',
	Unknown = 'Unknown',
}

// Venue type enum
export enum VenueType {
	Other = 'Other',
	Distribution = 'Distribution',
	Sto = 'Sto',
	Exchange = 'Exchange',
}

// Settlement leg
export interface SettlementLeg {
	from: PortfolioLike;
	to: PortfolioLike;
	asset: string;
	amount: string;
	nfts?: string[];
}

// Portfolio reference
export interface PortfolioLike {
	did: string;
	portfolioId?: string; // undefined = default portfolio
}

// Instruction details
export interface InstructionDetails {
	id: string;
	venueId: string;
	status: InstructionStatus;
	legs: SettlementLeg[];
	memo?: string;
	tradeDate?: Date;
	valueDate?: Date;
	createdAt?: Date;
	affirmations: AffirmationInfo[];
}

// Affirmation info
export interface AffirmationInfo {
	identity: string;
	status: 'Affirmed' | 'Pending';
	portfolios: string[];
}

// Venue details
export interface VenueDetails {
	id: string;
	owner: string;
	type: VenueType;
	description: string;
	signingKeys: string[];
}

/**
 * Parse instruction status from SDK
 */
export function parseInstructionStatus(status: unknown): InstructionStatus {
	if (typeof status === 'string') {
		if (Object.values(InstructionStatus).includes(status as InstructionStatus)) {
			return status as InstructionStatus;
		}
	}
	return InstructionStatus.Unknown;
}

/**
 * Parse venue type from SDK
 */
export function parseVenueType(type: unknown): VenueType {
	if (typeof type === 'string') {
		if (Object.values(VenueType).includes(type as VenueType)) {
			return type as VenueType;
		}
	}
	return VenueType.Other;
}

/**
 * Build a settlement leg
 */
export function buildSettlementLeg(params: {
	fromDid: string;
	fromPortfolioId?: string;
	toDid: string;
	toPortfolioId?: string;
	asset: string;
	amount: string;
	nfts?: string[];
}): SettlementLeg {
	return {
		from: {
			did: params.fromDid,
			portfolioId: params.fromPortfolioId,
		},
		to: {
			did: params.toDid,
			toPortfolioId: params.toPortfolioId,
		} as PortfolioLike,
		asset: params.asset.toUpperCase(),
		amount: params.amount,
		nfts: params.nfts,
	};
}

/**
 * Parse instruction from SDK result
 */
export function parseInstruction(instruction: unknown): InstructionDetails | null {
	if (!instruction || typeof instruction !== 'object') {
		return null;
	}
	
	const inst = instruction as Record<string, unknown>;
	
	return {
		id: String(inst.id || ''),
		venueId: String(inst.venueId || inst.venue || ''),
		status: parseInstructionStatus(inst.status),
		legs: Array.isArray(inst.legs) ? inst.legs.map(parseLeg).filter(Boolean) as SettlementLeg[] : [],
		memo: inst.memo as string | undefined,
		tradeDate: inst.tradeDate ? new Date(inst.tradeDate as string | number) : undefined,
		valueDate: inst.valueDate ? new Date(inst.valueDate as string | number) : undefined,
		createdAt: inst.createdAt ? new Date(inst.createdAt as string | number) : undefined,
		affirmations: Array.isArray(inst.affirmations) ? inst.affirmations.map(parseAffirmation) : [],
	};
}

/**
 * Parse a settlement leg from SDK result
 */
function parseLeg(leg: unknown): SettlementLeg | null {
	if (!leg || typeof leg !== 'object') {
		return null;
	}
	
	const l = leg as Record<string, unknown>;
	
	return {
		from: parsePortfolioLike(l.from),
		to: parsePortfolioLike(l.to),
		asset: String(l.asset || l.ticker || ''),
		amount: String(l.amount || '0'),
		nfts: Array.isArray(l.nfts) ? l.nfts.map(String) : undefined,
	};
}

/**
 * Parse portfolio-like object
 */
function parsePortfolioLike(portfolio: unknown): PortfolioLike {
	if (!portfolio || typeof portfolio !== 'object') {
		return { did: '' };
	}
	
	const p = portfolio as Record<string, unknown>;
	
	return {
		did: String(p.did || p.identity || ''),
		portfolioId: p.portfolioId ? String(p.portfolioId) : undefined,
	};
}

/**
 * Parse affirmation info
 */
function parseAffirmation(affirmation: unknown): AffirmationInfo {
	if (!affirmation || typeof affirmation !== 'object') {
		return { identity: '', status: 'Pending', portfolios: [] };
	}
	
	const a = affirmation as Record<string, unknown>;
	
	return {
		identity: String(a.identity || a.did || ''),
		status: a.status === 'Affirmed' ? 'Affirmed' : 'Pending',
		portfolios: Array.isArray(a.portfolios) ? a.portfolios.map(String) : [],
	};
}

/**
 * Parse venue from SDK result
 */
export function parseVenue(venue: unknown): VenueDetails | null {
	if (!venue || typeof venue !== 'object') {
		return null;
	}
	
	const v = venue as Record<string, unknown>;
	
	return {
		id: String(v.id || ''),
		owner: String(v.owner || ''),
		type: parseVenueType(v.type),
		description: String(v.description || ''),
		signingKeys: Array.isArray(v.signingKeys) ? v.signingKeys.map(String) : [],
	};
}

/**
 * Check if instruction is fully affirmed
 */
export function isFullyAffirmed(instruction: InstructionDetails): boolean {
	return instruction.affirmations.every((a) => a.status === 'Affirmed');
}

/**
 * Get pending affirmations for an instruction
 */
export function getPendingAffirmations(instruction: InstructionDetails): AffirmationInfo[] {
	return instruction.affirmations.filter((a) => a.status === 'Pending');
}

/**
 * Get unique parties involved in an instruction
 */
export function getInstructionParties(instruction: InstructionDetails): string[] {
	const parties = new Set<string>();
	
	for (const leg of instruction.legs) {
		if (leg.from.did) parties.add(leg.from.did);
		if (leg.to.did) parties.add(leg.to.did);
	}
	
	return Array.from(parties);
}

/**
 * Calculate total amounts by asset in instruction
 */
export function calculateInstructionTotals(instruction: InstructionDetails): Map<string, bigint> {
	const totals = new Map<string, bigint>();
	
	for (const leg of instruction.legs) {
		const current = totals.get(leg.asset) || BigInt(0);
		totals.set(leg.asset, current + BigInt(leg.amount));
	}
	
	return totals;
}

/**
 * Format instruction for display
 */
export function formatInstructionForDisplay(instruction: InstructionDetails): Record<string, string> {
	return {
		'ID': instruction.id,
		'Venue': instruction.venueId,
		'Status': instruction.status,
		'Legs': String(instruction.legs.length),
		'Memo': instruction.memo || 'None',
		'Trade Date': instruction.tradeDate?.toISOString() || 'Not set',
		'Value Date': instruction.valueDate?.toISOString() || 'Not set',
		'Fully Affirmed': isFullyAffirmed(instruction) ? 'Yes' : 'No',
	};
}

/**
 * Venue type options for UI
 */
export const VENUE_TYPE_OPTIONS = [
	{ name: 'Other', value: VenueType.Other },
	{ name: 'Distribution', value: VenueType.Distribution },
	{ name: 'STO', value: VenueType.Sto },
	{ name: 'Exchange', value: VenueType.Exchange },
];

/**
 * Instruction status options for filtering
 */
export const INSTRUCTION_STATUS_OPTIONS = [
	{ name: 'Pending', value: InstructionStatus.Pending },
	{ name: 'Affirmed', value: InstructionStatus.Affirmed },
	{ name: 'Executed', value: InstructionStatus.Executed },
	{ name: 'Rejected', value: InstructionStatus.Rejected },
	{ name: 'Failed', value: InstructionStatus.Failed },
];
