/**
 * Polymesh Claim Types
 * 
 * Claims are verifiable attestations about identities on Polymesh.
 * They are used to enforce compliance rules at the protocol level.
 */

// Main claim type categories
export const CLAIM_TYPES = {
	// Customer Due Diligence - Required for all participants
	CustomerDueDiligence: 'CustomerDueDiligence',
	
	// Accredited investor status
	Accredited: 'Accredited',
	
	// Affiliate of the asset issuer
	Affiliate: 'Affiliate',
	
	// Qualified purchaser status
	BuyLockup: 'BuyLockup',
	SellLockup: 'SellLockup',
	
	// Jurisdiction claim
	Jurisdiction: 'Jurisdiction',
	
	// KYC-related claims
	KnowYourCustomer: 'KnowYourCustomer',
	
	// Investor uniqueness (prevents double-counting)
	InvestorUniqueness: 'InvestorUniqueness',
	InvestorUniquenessV2: 'InvestorUniquenessV2',
	
	// Exempted from compliance
	Exempted: 'Exempted',
	
	// Blocked from transfers
	Blocked: 'Blocked',
	
	// Custom claims
	Custom: 'Custom',
} as const;

export type ClaimType = keyof typeof CLAIM_TYPES;

// Jurisdiction country codes (ISO 3166-1 alpha-2)
export const JURISDICTIONS = {
	US: { code: 'US', name: 'United States' },
	GB: { code: 'GB', name: 'United Kingdom' },
	DE: { code: 'DE', name: 'Germany' },
	FR: { code: 'FR', name: 'France' },
	CH: { code: 'CH', name: 'Switzerland' },
	SG: { code: 'SG', name: 'Singapore' },
	HK: { code: 'HK', name: 'Hong Kong' },
	JP: { code: 'JP', name: 'Japan' },
	AU: { code: 'AU', name: 'Australia' },
	CA: { code: 'CA', name: 'Canada' },
	AE: { code: 'AE', name: 'United Arab Emirates' },
	LI: { code: 'LI', name: 'Liechtenstein' },
	LU: { code: 'LU', name: 'Luxembourg' },
	IE: { code: 'IE', name: 'Ireland' },
	NL: { code: 'NL', name: 'Netherlands' },
	ES: { code: 'ES', name: 'Spain' },
	IT: { code: 'IT', name: 'Italy' },
	PT: { code: 'PT', name: 'Portugal' },
	SE: { code: 'SE', name: 'Sweden' },
	NO: { code: 'NO', name: 'Norway' },
	DK: { code: 'DK', name: 'Denmark' },
	FI: { code: 'FI', name: 'Finland' },
	AT: { code: 'AT', name: 'Austria' },
	BE: { code: 'BE', name: 'Belgium' },
	// Add more as needed
} as const;

// Claim scope types
export const CLAIM_SCOPE_TYPES = {
	Identity: 'Identity',
	Ticker: 'Ticker',
	Custom: 'Custom',
} as const;

// CDD claim provider info
export const CDD_PROVIDERS = {
	polymath: {
		name: 'Polymath',
		description: 'Default CDD provider by Polymath',
	},
	fractal: {
		name: 'Fractal ID',
		description: 'Decentralized identity verification',
	},
	netki: {
		name: 'Netki',
		description: 'Digital identity verification services',
	},
} as const;

// Claim expiry options
export const CLAIM_EXPIRY_OPTIONS = {
	never: null,
	oneMonth: 30 * 24 * 60 * 60 * 1000,
	threeMonths: 90 * 24 * 60 * 60 * 1000,
	sixMonths: 180 * 24 * 60 * 60 * 1000,
	oneYear: 365 * 24 * 60 * 60 * 1000,
	twoYears: 2 * 365 * 24 * 60 * 60 * 1000,
} as const;

// UI options for claim types
export const CLAIM_TYPE_OPTIONS = [
	{ name: 'Customer Due Diligence (CDD)', value: 'CustomerDueDiligence' },
	{ name: 'Accredited Investor', value: 'Accredited' },
	{ name: 'Affiliate', value: 'Affiliate' },
	{ name: 'Buy Lockup', value: 'BuyLockup' },
	{ name: 'Sell Lockup', value: 'SellLockup' },
	{ name: 'Jurisdiction', value: 'Jurisdiction' },
	{ name: 'Know Your Customer (KYC)', value: 'KnowYourCustomer' },
	{ name: 'Investor Uniqueness', value: 'InvestorUniqueness' },
	{ name: 'Exempted', value: 'Exempted' },
	{ name: 'Blocked', value: 'Blocked' },
	{ name: 'Custom', value: 'Custom' },
];

// Jurisdiction options for UI
export const JURISDICTION_OPTIONS = Object.entries(JURISDICTIONS).map(([code, info]) => ({
	name: `${info.name} (${code})`,
	value: code,
}));

// Claim scope type options for UI
export const SCOPE_TYPE_OPTIONS = [
	{ name: 'Identity (specific DID)', value: 'Identity' },
	{ name: 'Ticker (specific asset)', value: 'Ticker' },
	{ name: 'Custom', value: 'Custom' },
];
