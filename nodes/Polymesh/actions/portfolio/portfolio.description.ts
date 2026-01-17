import { INodeProperties } from 'n8n-workflow';

export const portfolioOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['portfolio'],
		},
	},
	options: [
		{
			name: 'Create Portfolio',
			value: 'createPortfolio',
			description: 'Create a new numbered portfolio',
			action: 'Create a new portfolio',
		},
		{
			name: 'Delete Portfolio',
			value: 'deletePortfolio',
			description: 'Delete a numbered portfolio',
			action: 'Delete a portfolio',
		},
		{
			name: 'Get Custodian',
			value: 'getCustodian',
			description: 'Get the custodian of a portfolio',
			action: 'Get portfolio custodian',
		},
		{
			name: 'Get Default Portfolio',
			value: 'getDefaultPortfolio',
			description: 'Get the default portfolio for an identity',
			action: 'Get default portfolio',
		},
		{
			name: 'Get Numbered Portfolios',
			value: 'getNumberedPortfolios',
			description: 'Get all numbered portfolios for an identity',
			action: 'Get numbered portfolios',
		},
		{
			name: 'Get Portfolio',
			value: 'getPortfolio',
			description: 'Get portfolio details by ID',
			action: 'Get portfolio details',
		},
		{
			name: 'Get Portfolio Assets',
			value: 'getPortfolioAssets',
			description: 'Get all assets in a portfolio',
			action: 'Get portfolio assets',
		},
		{
			name: 'Get Portfolio Transactions',
			value: 'getPortfolioTransactions',
			description: 'Get transaction history for a portfolio',
			action: 'Get portfolio transactions',
		},
		{
			name: 'Move Assets',
			value: 'moveAssets',
			description: 'Move assets between portfolios',
			action: 'Move assets between portfolios',
		},
		{
			name: 'Quit Custody',
			value: 'quitCustody',
			description: 'Quit custodianship of a portfolio',
			action: 'Quit portfolio custody',
		},
		{
			name: 'Rename Portfolio',
			value: 'renamePortfolio',
			description: 'Rename a numbered portfolio',
			action: 'Rename a portfolio',
		},
		{
			name: 'Set Custodian',
			value: 'setCustodian',
			description: 'Set the custodian of a portfolio',
			action: 'Set portfolio custodian',
		},
	],
	default: 'getPortfolio',
};

export const portfolioFields: INodeProperties[] = [
	// Portfolio ID for most operations
	{
		displayName: 'Portfolio ID',
		name: 'portfolioId',
		type: 'string',
		default: '',
		placeholder: '1',
		description: 'The numbered portfolio ID (use 0 or leave empty for default portfolio)',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: [
					'getPortfolio',
					'deletePortfolio',
					'renamePortfolio',
					'getPortfolioAssets',
					'getPortfolioTransactions',
					'moveAssets',
					'getCustodian',
					'setCustodian',
					'quitCustody',
				],
			},
		},
	},
	// DID for identity-based lookups
	{
		displayName: 'DID',
		name: 'did',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'The identity DID (leave empty to use signing identity)',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: [
					'getDefaultPortfolio',
					'getNumberedPortfolios',
					'getPortfolio',
				],
			},
		},
	},
	// Portfolio name for create/rename
	{
		displayName: 'Portfolio Name',
		name: 'portfolioName',
		type: 'string',
		default: '',
		placeholder: 'My Portfolio',
		description: 'Name for the portfolio',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['createPortfolio', 'renamePortfolio'],
			},
		},
		required: true,
	},
	// Custodian DID
	{
		displayName: 'Custodian DID',
		name: 'custodianDid',
		type: 'string',
		default: '',
		placeholder: '0x...',
		description: 'DID of the custodian to set',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['setCustodian'],
			},
		},
		required: true,
	},
	// Move assets fields
	{
		displayName: 'From Portfolio ID',
		name: 'fromPortfolioId',
		type: 'string',
		default: '',
		placeholder: '0',
		description: 'Source portfolio ID (0 for default)',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['moveAssets'],
			},
		},
	},
	{
		displayName: 'To Portfolio ID',
		name: 'toPortfolioId',
		type: 'string',
		default: '',
		placeholder: '1',
		description: 'Destination portfolio ID',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['moveAssets'],
			},
		},
		required: true,
	},
	{
		displayName: 'Asset Ticker',
		name: 'ticker',
		type: 'string',
		default: '',
		placeholder: 'ACME',
		description: 'Ticker of the asset to move',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['moveAssets'],
			},
		},
		required: true,
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		placeholder: '1000',
		description: 'Amount of tokens to move',
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: ['moveAssets'],
			},
		},
		required: true,
	},
	// Additional options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['portfolio'],
				operation: [
					'getPortfolioAssets',
					'getPortfolioTransactions',
				],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 100,
				description: 'Maximum number of results to return',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				description: 'Number of results to skip',
			},
		],
	},
];
