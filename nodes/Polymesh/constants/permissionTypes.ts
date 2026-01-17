/**
 * Polymesh Permission Types
 * 
 * Permissions control what actions different keys and external agents
 * can perform on assets and portfolios.
 */

// Permission groups for external agents
export const PERMISSION_GROUPS = {
	// Full control over the asset
	Full: 'Full',
	
	// Pre-defined permission groups
	ExceptMeta: 'ExceptMeta',
	PolymeshV1CAA: 'PolymeshV1CAA',
	PolymeshV1PIA: 'PolymeshV1PIA',
	
	// Custom permission group
	Custom: 'Custom',
} as const;

export type PermissionGroup = keyof typeof PERMISSION_GROUPS;

// Specific permission types for assets
export const ASSET_PERMISSIONS = {
	// Token operations
	Issue: 'Issue',
	Redeem: 'Redeem',
	ControllerTransfer: 'ControllerTransfer',
	
	// Asset management
	Freeze: 'Freeze',
	Unfreeze: 'Unfreeze',
	Rename: 'Rename',
	MakeDivisible: 'MakeDivisible',
	
	// Documents
	AddDocuments: 'AddDocuments',
	RemoveDocuments: 'RemoveDocuments',
	
	// Compliance
	SetComplianceRequirements: 'SetComplianceRequirements',
	ResetComplianceRequirements: 'ResetComplianceRequirements',
	PauseCompliance: 'PauseCompliance',
	ResumeCompliance: 'ResumeCompliance',
	
	// Claims
	AddDefaultTrustedClaimIssuer: 'AddDefaultTrustedClaimIssuer',
	RemoveDefaultTrustedClaimIssuer: 'RemoveDefaultTrustedClaimIssuer',
	
	// Corporate actions
	InitiateCorporateAction: 'InitiateCorporateAction',
	LinkCADoc: 'LinkCADoc',
	RemoveCA: 'RemoveCA',
	
	// Checkpoints
	CreateCheckpoint: 'CreateCheckpoint',
	CreateCheckpointSchedule: 'CreateCheckpointSchedule',
	RemoveCheckpointSchedule: 'RemoveCheckpointSchedule',
	
	// Statistics
	SetActiveAssetStats: 'SetActiveAssetStats',
	RemoveAssetStats: 'RemoveAssetStats',
	
	// External agents
	AddExternalAgent: 'AddExternalAgent',
	RemoveExternalAgent: 'RemoveExternalAgent',
} as const;

export type AssetPermission = keyof typeof ASSET_PERMISSIONS;

// Portfolio permissions
export const PORTFOLIO_PERMISSIONS = {
	Custody: 'Custody',
	MoveAssets: 'MoveAssets',
} as const;

export type PortfolioPermission = keyof typeof PORTFOLIO_PERMISSIONS;

// Transaction permissions for keys
export const TRANSACTION_PERMISSIONS = {
	// Whole module permissions
	Whole: 'Whole',
	
	// Specific extrinsic permissions
	These: 'These',
	
	// Except specific extrinsics
	Except: 'Except',
} as const;

// Secondary key permissions
export interface SecondaryKeyPermissions {
	assets?: {
		type: 'Whole' | 'These' | 'Except';
		values?: string[]; // Asset tickers
	};
	portfolios?: {
		type: 'Whole' | 'These' | 'Except';
		values?: Array<{ did: string; portfolioId: string }>;
	};
	transactions?: {
		type: 'Whole' | 'These' | 'Except';
		values?: string[];
	};
}

// Permission group options for UI
export const PERMISSION_GROUP_OPTIONS = [
	{ name: 'Full Control', value: 'Full' },
	{ name: 'All Except Meta', value: 'ExceptMeta' },
	{ name: 'Corporate Actions Agent (CAA)', value: 'PolymeshV1CAA' },
	{ name: 'Primary Issuance Agent (PIA)', value: 'PolymeshV1PIA' },
	{ name: 'Custom Permissions', value: 'Custom' },
];

// Asset permission options for UI
export const ASSET_PERMISSION_OPTIONS = [
	{ name: 'Issue Tokens', value: 'Issue' },
	{ name: 'Redeem Tokens', value: 'Redeem' },
	{ name: 'Controller Transfer', value: 'ControllerTransfer' },
	{ name: 'Freeze Asset', value: 'Freeze' },
	{ name: 'Unfreeze Asset', value: 'Unfreeze' },
	{ name: 'Rename Asset', value: 'Rename' },
	{ name: 'Make Divisible', value: 'MakeDivisible' },
	{ name: 'Add Documents', value: 'AddDocuments' },
	{ name: 'Remove Documents', value: 'RemoveDocuments' },
	{ name: 'Set Compliance', value: 'SetComplianceRequirements' },
	{ name: 'Reset Compliance', value: 'ResetComplianceRequirements' },
	{ name: 'Pause Compliance', value: 'PauseCompliance' },
	{ name: 'Resume Compliance', value: 'ResumeCompliance' },
	{ name: 'Manage Corporate Actions', value: 'InitiateCorporateAction' },
	{ name: 'Create Checkpoints', value: 'CreateCheckpoint' },
	{ name: 'Manage External Agents', value: 'AddExternalAgent' },
];

// Transaction groups (Polymesh modules)
export const TRANSACTION_GROUPS = {
	Asset: 'asset',
	Settlement: 'settlement',
	Sto: 'sto',
	Checkpoint: 'checkpoint',
	ComplianceManager: 'complianceManager',
	CorporateAction: 'corporateAction',
	CorporateBallot: 'corporateBallot',
	CapitalDistribution: 'capitalDistribution',
	Portfolio: 'portfolio',
	Identity: 'identity',
	ExternalAgents: 'externalAgents',
	Statistics: 'statistics',
	Nft: 'nft',
} as const;
