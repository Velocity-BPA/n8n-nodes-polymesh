/**
 * Polymesh Asset Identifier Types
 * 
 * Standard securities identifiers that can be associated with
 * Polymesh security tokens for regulatory and tracking purposes.
 */

// Asset identifier types
export const ASSET_IDENTIFIER_TYPES = {
	// International Securities Identification Number
	ISIN: 'ISIN',
	
	// Committee on Uniform Securities Identification Procedures
	CUSIP: 'CUSIP',
	
	// CUSIP International Numbering System
	CINS: 'CINS',
	
	// Legal Entity Identifier
	LEI: 'LEI',
	
	// Financial Instrument Global Identifier
	FIGI: 'FIGI',
	
	// Custom identifier
	Custom: 'Custom',
} as const;

export type AssetIdentifierType = keyof typeof ASSET_IDENTIFIER_TYPES;

// Asset types on Polymesh
export const ASSET_TYPES = {
	EquityCommon: 'EquityCommon',
	EquityPreferred: 'EquityPreferred',
	Commodity: 'Commodity',
	FixedIncome: 'FixedIncome',
	REIT: 'REIT',
	Fund: 'Fund',
	RevenueShareAgreement: 'RevenueShareAgreement',
	StructuredProduct: 'StructuredProduct',
	Derivative: 'Derivative',
	StableCoin: 'StableCoin',
	Custom: 'Custom',
} as const;

export type AssetType = keyof typeof ASSET_TYPES;

// Document types for assets
export const DOCUMENT_TYPES = {
	Prospectus: 'Prospectus',
	OfferingMemorandum: 'OfferingMemorandum',
	TermSheet: 'TermSheet',
	SubscriptionAgreement: 'SubscriptionAgreement',
	AnnualReport: 'AnnualReport',
	QuarterlyReport: 'QuarterlyReport',
	BoardResolution: 'BoardResolution',
	LegalOpinion: 'LegalOpinion',
	TaxOpinion: 'TaxOpinion',
	PrivatePlacementMemorandum: 'PrivatePlacementMemorandum',
	Other: 'Other',
} as const;

export type DocumentType = keyof typeof DOCUMENT_TYPES;

// Security token standards/metadata
export const METADATA_KEYS = {
	// Standard metadata
	Name: 'name',
	Symbol: 'symbol',
	Description: 'description',
	Website: 'website',
	Logo: 'logo',
	
	// Regulatory metadata
	Jurisdiction: 'jurisdiction',
	ExemptionType: 'exemptionType',
	OfferingType: 'offeringType',
	
	// Financial metadata
	ValuationDate: 'valuationDate',
	PricePerToken: 'pricePerToken',
	Currency: 'currency',
	
	// Custom metadata
	Custom: 'custom',
} as const;

// Asset type options for UI
export const ASSET_TYPE_OPTIONS = [
	{ name: 'Common Equity', value: 'EquityCommon' },
	{ name: 'Preferred Equity', value: 'EquityPreferred' },
	{ name: 'Commodity', value: 'Commodity' },
	{ name: 'Fixed Income / Bond', value: 'FixedIncome' },
	{ name: 'Real Estate Investment Trust (REIT)', value: 'REIT' },
	{ name: 'Fund', value: 'Fund' },
	{ name: 'Revenue Share Agreement', value: 'RevenueShareAgreement' },
	{ name: 'Structured Product', value: 'StructuredProduct' },
	{ name: 'Derivative', value: 'Derivative' },
	{ name: 'Stable Coin', value: 'StableCoin' },
	{ name: 'Custom', value: 'Custom' },
];

// Asset identifier options for UI
export const ASSET_IDENTIFIER_OPTIONS = [
	{ name: 'ISIN (International Securities ID)', value: 'ISIN' },
	{ name: 'CUSIP (US/Canada)', value: 'CUSIP' },
	{ name: 'CINS (International CUSIP)', value: 'CINS' },
	{ name: 'LEI (Legal Entity ID)', value: 'LEI' },
	{ name: 'FIGI (Bloomberg)', value: 'FIGI' },
	{ name: 'Custom', value: 'Custom' },
];

// Document type options for UI
export const DOCUMENT_TYPE_OPTIONS = [
	{ name: 'Prospectus', value: 'Prospectus' },
	{ name: 'Offering Memorandum', value: 'OfferingMemorandum' },
	{ name: 'Term Sheet', value: 'TermSheet' },
	{ name: 'Subscription Agreement', value: 'SubscriptionAgreement' },
	{ name: 'Annual Report', value: 'AnnualReport' },
	{ name: 'Quarterly Report', value: 'QuarterlyReport' },
	{ name: 'Board Resolution', value: 'BoardResolution' },
	{ name: 'Legal Opinion', value: 'LegalOpinion' },
	{ name: 'Tax Opinion', value: 'TaxOpinion' },
	{ name: 'Private Placement Memorandum', value: 'PrivatePlacementMemorandum' },
	{ name: 'Other', value: 'Other' },
];

// Funding round options
export const FUNDING_ROUND_OPTIONS = [
	{ name: 'Seed', value: 'Seed' },
	{ name: 'Series A', value: 'SeriesA' },
	{ name: 'Series B', value: 'SeriesB' },
	{ name: 'Series C', value: 'SeriesC' },
	{ name: 'Series D', value: 'SeriesD' },
	{ name: 'Private Placement', value: 'PrivatePlacement' },
	{ name: 'Public Offering', value: 'PublicOffering' },
	{ name: 'Other', value: 'Other' },
];

// Ticker validation
export const TICKER_REGEX = /^[A-Z0-9]{1,12}$/;
export const TICKER_MAX_LENGTH = 12;

// ISIN validation (2 letter country + 9 alphanumeric + 1 check digit)
export const ISIN_REGEX = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

// CUSIP validation (9 characters)
export const CUSIP_REGEX = /^[A-Z0-9]{9}$/;

// LEI validation (20 characters)
export const LEI_REGEX = /^[A-Z0-9]{20}$/;

// Alias for backwards compatibility
export const IDENTIFIER_TYPE_OPTIONS = ASSET_IDENTIFIER_OPTIONS;
