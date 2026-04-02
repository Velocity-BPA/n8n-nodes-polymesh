/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-polymesh/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Polymesh implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Polymesh',
    name: 'polymesh',
    icon: 'file:polymesh.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Polymesh API',
    defaults: {
      name: 'Polymesh',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'polymeshApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Asset',
            value: 'asset',
          },
          {
            name: 'Identity',
            value: 'identity',
          },
          {
            name: 'Portfolio',
            value: 'portfolio',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Compliance',
            value: 'compliance',
          },
          {
            name: 'Venue',
            value: 'venue',
          },
          {
            name: 'Identities',
            value: 'identities',
          },
          {
            name: 'Assets',
            value: 'assets',
          },
          {
            name: 'Portfolios',
            value: 'portfolios',
          },
          {
            name: 'Settlements',
            value: 'settlements',
          },
          {
            name: 'Instructions',
            value: 'instructions',
          },
          {
            name: 'Claims',
            value: 'claims',
          },
          {
            name: 'Blocks',
            value: 'blocks',
          },
          {
            name: 'Transactions',
            value: 'transactions',
          }
        ],
        default: 'asset',
      },
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['asset'] } },
  options: [
    { name: 'Get Asset', value: 'getAsset', description: 'Retrieve asset details by ticker', action: 'Get asset details' },
    { name: 'Get All Assets', value: 'getAllAssets', description: 'List all assets with pagination', action: 'Get all assets' },
    { name: 'Create Asset', value: 'createAsset', description: 'Create a new security token', action: 'Create a new asset' },
    { name: 'Update Asset', value: 'updateAsset', description: 'Update asset properties', action: 'Update asset properties' },
    { name: 'Freeze Asset', value: 'freezeAsset', description: 'Freeze an asset', action: 'Freeze an asset' },
    { name: 'Unfreeze Asset', value: 'unfreezeAsset', description: 'Unfreeze an asset', action: 'Unfreeze an asset' },
  ],
  default: 'getAsset',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['identity'] } },
  options: [
    { name: 'Get Identity', value: 'getIdentity', description: 'Retrieve identity details by DID', action: 'Get identity details' },
    { name: 'Get All Identities', value: 'getAllIdentities', description: 'List identities with filters', action: 'Get all identities' },
    { name: 'Create Identity', value: 'createIdentity', description: 'Register new identity', action: 'Create new identity' },
    { name: 'Update Identity CDD', value: 'updateIdentityCdd', description: 'Update CDD claim for identity', action: 'Update identity CDD' },
    { name: 'Revoke Identity CDD', value: 'revokeIdentityCdd', description: 'Revoke CDD claim for identity', action: 'Revoke identity CDD' },
    { name: 'Get Identity Portfolios', value: 'getIdentityPortfolios', description: 'Get portfolios for an identity', action: 'Get identity portfolios' },
  ],
  default: 'getIdentity',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['portfolio'] } },
  options: [
    { name: 'Get Portfolio', value: 'getPortfolio', description: 'Get portfolio details', action: 'Get portfolio' },
    { name: 'Get Portfolios By Identity', value: 'getPortfoliosByIdentity', description: 'List portfolios for identity', action: 'Get portfolios by identity' },
    { name: 'Create Portfolio', value: 'createPortfolio', description: 'Create new portfolio', action: 'Create portfolio' },
    { name: 'Update Portfolio', value: 'updatePortfolio', description: 'Update portfolio name', action: 'Update portfolio' },
    { name: 'Delete Portfolio', value: 'deletePortfolio', description: 'Delete portfolio', action: 'Delete portfolio' },
    { name: 'Get Portfolio Balances', value: 'getPortfolioBalances', description: 'Get asset balances', action: 'Get portfolio balances' },
  ],
  default: 'getPortfolio',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['transaction'] } },
	options: [
		{ name: 'Create Settlement', value: 'createSettlement', description: 'Create settlement instruction', action: 'Create settlement' },
		{ name: 'Get Settlement', value: 'getSettlement', description: 'Get settlement details', action: 'Get settlement' },
		{ name: 'Get All Settlements', value: 'getAllSettlements', description: 'List settlements with filters', action: 'Get all settlements' },
		{ name: 'Affirm Settlement', value: 'affirmSettlement', description: 'Affirm settlement leg', action: 'Affirm settlement' },
		{ name: 'Reject Settlement', value: 'rejectSettlement', description: 'Reject settlement instruction', action: 'Reject settlement' },
		{ name: 'Execute Settlement', value: 'executeSettlement', description: 'Execute settlement', action: 'Execute settlement' },
	],
	default: 'createSettlement',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['compliance'],
		},
	},
	options: [
		{
			name: 'Get Compliance Requirements',
			value: 'getComplianceRequirements',
			description: 'Get transfer requirements for a ticker',
			action: 'Get compliance requirements',
		},
		{
			name: 'Create Compliance Requirement',
			value: 'createComplianceRequirement',
			description: 'Add compliance rule for a ticker',
			action: 'Create compliance requirement',
		},
		{
			name: 'Update Compliance Requirement',
			value: 'updateComplianceRequirement',
			description: 'Update compliance rule for a ticker',
			action: 'Update compliance requirement',
		},
		{
			name: 'Delete Compliance Requirement',
			value: 'deleteComplianceRequirement',
			description: 'Remove compliance rule for a ticker',
			action: 'Delete compliance requirement',
		},
		{
			name: 'Pause Compliance',
			value: 'pauseCompliance',
			description: 'Pause compliance checks for a ticker',
			action: 'Pause compliance',
		},
		{
			name: 'Resume Compliance',
			value: 'resumeCompliance',
			description: 'Resume compliance checks for a ticker',
			action: 'Resume compliance',
		},
	],
	default: 'getComplianceRequirements',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['venue'] } },
  options: [
    { name: 'Get Venue', value: 'getVenue', description: 'Get venue details by ID', action: 'Get venue details' },
    { name: 'Get All Venues', value: 'getAllVenues', description: 'List all settlement venues', action: 'Get all venues' },
    { name: 'Create Venue', value: 'createVenue', description: 'Create new settlement venue', action: 'Create a venue' },
    { name: 'Update Venue', value: 'updateVenue', description: 'Update venue details', action: 'Update a venue' },
    { name: 'Get Venue Instructions', value: 'getVenueInstructions', description: 'Get venue settlement instructions', action: 'Get venue instructions' },
    { name: 'Allow Instruction Types', value: 'allowInstructionTypes', description: 'Configure allowed instruction types for venue', action: 'Allow instruction types' }
  ],
  default: 'getVenue',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['identities'],
    },
  },
  options: [
    {
      name: 'Get Identity',
      value: 'getIdentity',
      description: 'Retrieve identity details by DID',
      action: 'Get identity details',
    },
    {
      name: 'List Identities',
      value: 'listIdentities',
      description: 'Get all identities with pagination',
      action: 'List all identities',
    },
    {
      name: 'Get Identity Portfolios',
      value: 'getIdentityPortfolios',
      description: 'Get portfolios owned by identity',
      action: 'Get identity portfolios',
    },
    {
      name: 'Get Identity Claims',
      value: 'getIdentityClaims',
      description: 'Get claims associated with identity',
      action: 'Get identity claims',
    },
    {
      name: 'Get Identity Instructions',
      value: 'getIdentityInstructions',
      description: 'Get settlement instructions for identity',
      action: 'Get identity instructions',
    },
  ],
  default: 'getIdentity',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['assets'],
    },
  },
  options: [
    {
      name: 'Get Asset',
      value: 'getAsset',
      description: 'Get asset details by ticker symbol',
      action: 'Get asset details',
    },
    {
      name: 'List Assets',
      value: 'listAssets',
      description: 'Get all assets with filtering',
      action: 'List all assets',
    },
    {
      name: 'Get Asset Holders',
      value: 'getAssetHolders',
      description: 'Get current token holders for an asset',
      action: 'Get asset holders',
    },
    {
      name: 'Get Asset Transactions',
      value: 'getAssetTransactions',
      description: 'Get asset transaction history',
      action: 'Get asset transactions',
    },
    {
      name: 'Get Asset Documents',
      value: 'getAssetDocuments',
      description: 'Get asset legal documents',
      action: 'Get asset documents',
    },
    {
      name: 'Get Compliance Requirements',
      value: 'getComplianceRequirements',
      description: 'Get compliance rules for asset',
      action: 'Get compliance requirements',
    },
  ],
  default: 'getAsset',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['portfolios'],
    },
  },
  options: [
    {
      name: 'Get Portfolio',
      value: 'getPortfolio',
      description: 'Get portfolio details',
      action: 'Get portfolio details',
    },
    {
      name: 'Get Portfolios by DID',
      value: 'getPortfoliosByDid',
      description: 'Get all portfolios for an identity',
      action: 'Get portfolios by DID',
    },
    {
      name: 'Get Portfolio Movements',
      value: 'getPortfolioMovements',
      description: 'Get portfolio transaction history',
      action: 'Get portfolio movements',
    },
    {
      name: 'Get Portfolio Balances',
      value: 'getPortfolioBalances',
      description: 'Get current asset balances',
      action: 'Get portfolio balances',
    },
  ],
  default: 'getPortfolio',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['settlements'],
    },
  },
  options: [
    {
      name: 'Get Settlement',
      value: 'getSettlement',
      description: 'Get settlement instruction details',
      action: 'Get settlement instruction details',
    },
    {
      name: 'List Settlements',
      value: 'listSettlements',
      description: 'Get settlement instructions with filtering',
      action: 'List settlement instructions',
    },
    {
      name: 'Get Settlement Legs',
      value: 'getSettlementLegs',
      description: 'Get individual legs of settlement',
      action: 'Get settlement legs',
    },
    {
      name: 'Get Settlement Affirmations',
      value: 'getSettlementAffirmations',
      description: 'Get affirmation status',
      action: 'Get settlement affirmations',
    },
  ],
  default: 'getSettlement',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['instructions'],
    },
  },
  options: [
    {
      name: 'Get Instruction',
      value: 'getInstruction',
      description: 'Get instruction details by ID',
      action: 'Get instruction',
    },
    {
      name: 'List Instructions',
      value: 'listInstructions',
      description: 'Get instructions with filtering',
      action: 'List instructions',
    },
    {
      name: 'Get Instruction Legs',
      value: 'getInstructionLegs',
      description: 'Get transfer legs of instruction',
      action: 'Get instruction legs',
    },
    {
      name: 'Get Instruction Affirmations',
      value: 'getInstructionAffirmations',
      description: 'Get affirmation details',
      action: 'Get instruction affirmations',
    },
    {
      name: 'Get Instruction Events',
      value: 'getInstructionEvents',
      description: 'Get instruction event history',
      action: 'Get instruction events',
    },
  ],
  default: 'getInstruction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['claims'],
    },
  },
  options: [
    {
      name: 'List Claims',
      value: 'listClaims',
      description: 'Get claims with filtering',
      action: 'List claims',
    },
    {
      name: 'Get Claims by Target',
      value: 'getClaimsByTarget',
      description: 'Get claims for specific identity',
      action: 'Get claims by target',
    },
    {
      name: 'Get Claim Issuers',
      value: 'getClaimIssuers',
      description: 'Get list of claim issuers',
      action: 'Get claim issuers',
    },
  ],
  default: 'listClaims',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
    },
  },
  options: [
    {
      name: 'Get Latest Block',
      value: 'getLatestBlock',
      description: 'Get the latest block information',
      action: 'Get latest block',
    },
    {
      name: 'Get Block',
      value: 'getBlock',
      description: 'Get block by hash or number',
      action: 'Get block by hash or number',
    },
    {
      name: 'List Blocks',
      value: 'listBlocks',
      description: 'Get blocks with pagination',
      action: 'List blocks with pagination',
    },
    {
      name: 'Get Block Transactions',
      value: 'getBlockTransactions',
      description: 'Get transactions in a specific block',
      action: 'Get transactions in block',
    },
  ],
  default: 'getLatestBlock',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
    },
  },
  options: [
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction details by hash',
      action: 'Get transaction details',
    },
    {
      name: 'List Transactions',
      value: 'listTransactions',
      description: 'Get transactions with filtering',
      action: 'List transactions',
    },
    {
      name: 'Get Transaction Events',
      value: 'getTransactionEvents',
      description: 'Get events emitted by transaction',
      action: 'Get transaction events',
    },
  ],
  default: 'getTransaction',
},
{
  displayName: 'Ticker',
  name: 'ticker',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['getAsset', 'updateAsset', 'freezeAsset', 'unfreezeAsset'] } },
  default: '',
  description: 'The ticker symbol of the asset',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['asset'], operation: ['getAllAssets'] } },
  default: 10,
  description: 'Maximum number of assets to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: { show: { resource: ['asset'], operation: ['getAllAssets'] } },
  default: 0,
  description: 'Number of assets to skip',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['createAsset'] } },
  default: '',
  description: 'The name of the asset',
},
{
  displayName: 'Ticker',
  name: 'ticker',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['createAsset'] } },
  default: '',
  description: 'The ticker symbol of the asset',
},
{
  displayName: 'Divisible',
  name: 'divisible',
  type: 'boolean',
  displayOptions: { show: { resource: ['asset'], operation: ['createAsset'] } },
  default: true,
  description: 'Whether the asset is divisible',
},
{
  displayName: 'Asset Type',
  name: 'assetType',
  type: 'options',
  displayOptions: { show: { resource: ['asset'], operation: ['createAsset'] } },
  options: [
    { name: 'Equity Token', value: 'EquityCommon' },
    { name: 'Security Token', value: 'SecurityToken' },
    { name: 'Utility Token', value: 'UtilityToken' },
    { name: 'Investment Fund', value: 'InvestmentFund' },
  ],
  default: 'SecurityToken',
  description: 'The type of asset to create',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  displayOptions: { show: { resource: ['asset'], operation: ['updateAsset'] } },
  default: '',
  description: 'The updated name of the asset',
},
{
  displayName: 'Funding Round',
  name: 'fundingRound',
  type: 'string',
  displayOptions: { show: { resource: ['asset'], operation: ['updateAsset'] } },
  default: '',
  description: 'The funding round identifier',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['identity'], operation: ['getIdentity'] } },
  default: '',
  description: 'The decentralized identifier (DID) of the identity',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['identity'], operation: ['getAllIdentities'] } },
  default: 100,
  description: 'Maximum number of identities to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: { show: { resource: ['identity'], operation: ['getAllIdentities'] } },
  default: 0,
  description: 'Number of identities to skip',
},
{
  displayName: 'Has Valid CDD',
  name: 'hasValidCdd',
  type: 'boolean',
  displayOptions: { show: { resource: ['identity'], operation: ['getAllIdentities'] } },
  default: false,
  description: 'Filter identities by valid CDD status',
},
{
  displayName: 'Target Account',
  name: 'targetAccount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['identity'], operation: ['createIdentity'] } },
  default: '',
  description: 'The target account address for the new identity',
},
{
  displayName: 'Expiry',
  name: 'expiry',
  type: 'string',
  displayOptions: { show: { resource: ['identity'], operation: ['createIdentity', 'updateIdentityCdd'] } },
  default: '',
  description: 'Expiry date for the identity or CDD claim (ISO 8601 format)',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['identity'], operation: ['updateIdentityCdd'] } },
  default: '',
  description: 'The decentralized identifier (DID) of the identity',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['identity'], operation: ['revokeIdentityCdd'] } },
  default: '',
  description: 'The decentralized identifier (DID) of the identity',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['identity'], operation: ['getIdentityPortfolios'] } },
  default: '',
  description: 'The decentralized identifier (DID) of the identity',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['portfolio'],
      operation: ['getPortfolio', 'getPortfoliosByIdentity', 'createPortfolio', 'updatePortfolio', 'deletePortfolio', 'getPortfolioBalances'],
    },
  },
  default: '',
  description: 'The decentralized identifier',
},
{
  displayName: 'Portfolio ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['portfolio'],
      operation: ['getPortfolio', 'updatePortfolio', 'deletePortfolio', 'getPortfolioBalances'],
    },
  },
  default: '',
  description: 'The portfolio identifier',
},
{
  displayName: 'Portfolio Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['portfolio'],
      operation: ['createPortfolio', 'updatePortfolio'],
    },
  },
  default: '',
  description: 'The name of the portfolio',
},
{
	displayName: 'Legs',
	name: 'legs',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['createSettlement'],
		},
	},
	default: '',
	description: 'Settlement legs containing asset transfers',
},
{
	displayName: 'Venue ID',
	name: 'venueId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['createSettlement'],
		},
	},
	default: '',
	description: 'The venue ID for the settlement',
},
{
	displayName: 'Type',
	name: 'type',
	type: 'options',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['createSettlement'],
		},
	},
	options: [
		{ name: 'SettleOnAffirmation', value: 'SettleOnAffirmation' },
		{ name: 'SettleOnBlock', value: 'SettleOnBlock' },
		{ name: 'SettleManual', value: 'SettleManual' },
	],
	default: 'SettleOnAffirmation',
	description: 'Settlement type',
},
{
	displayName: 'Settlement ID',
	name: 'id',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getSettlement', 'affirmSettlement', 'rejectSettlement', 'executeSettlement'],
		},
	},
	default: '',
	description: 'The settlement instruction ID',
},
{
	displayName: 'Status',
	name: 'status',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getAllSettlements'],
		},
	},
	options: [
		{ name: 'Pending', value: 'Pending' },
		{ name: 'Failed', value: 'Failed' },
		{ name: 'Rejected', value: 'Rejected' },
		{ name: 'Executed', value: 'Executed' },
	],
	default: 'Pending',
	description: 'Filter by settlement status',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getAllSettlements'],
		},
	},
	default: 50,
	description: 'Maximum number of results to return',
},
{
	displayName: 'Offset',
	name: 'offset',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getAllSettlements'],
		},
	},
	default: 0,
	description: 'Number of results to skip',
},
{
	displayName: 'Portfolios',
	name: 'portfolios',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['affirmSettlement'],
		},
	},
	default: '',
	description: 'Portfolios to use for affirmation',
},
{
	displayName: 'Ticker',
	name: 'ticker',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['compliance'],
			operation: ['getComplianceRequirements', 'createComplianceRequirement', 'updateComplianceRequirement', 'deleteComplianceRequirement', 'pauseCompliance', 'resumeCompliance'],
		},
	},
	default: '',
	description: 'The ticker symbol of the security token',
},
{
	displayName: 'Requirement ID',
	name: 'id',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['compliance'],
			operation: ['updateComplianceRequirement', 'deleteComplianceRequirement'],
		},
	},
	default: '',
	description: 'The ID of the compliance requirement',
},
{
	displayName: 'Sender Conditions',
	name: 'senderConditions',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['compliance'],
			operation: ['createComplianceRequirement', 'updateComplianceRequirement'],
		},
	},
	default: '{}',
	description: 'JSON object defining sender compliance conditions',
},
{
	displayName: 'Receiver Conditions',
	name: 'receiverConditions',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['compliance'],
			operation: ['createComplianceRequirement', 'updateComplianceRequirement'],
		},
	},
	default: '{}',
	description: 'JSON object defining receiver compliance conditions',
},
{
  displayName: 'Venue ID',
  name: 'venueId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['venue'],
      operation: ['getVenue', 'updateVenue', 'getVenueInstructions', 'allowInstructionTypes']
    }
  },
  default: '',
  description: 'The unique identifier of the venue'
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['venue'],
      operation: ['getAllVenues']
    }
  },
  default: 50,
  description: 'Maximum number of venues to return'
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['venue'],
      operation: ['getAllVenues']
    }
  },
  default: 0,
  description: 'Number of venues to skip'
},
{
  displayName: 'Details',
  name: 'details',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['venue'],
      operation: ['createVenue', 'updateVenue']
    }
  },
  default: '',
  description: 'Venue details description'
},
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  options: [
    { name: 'Other', value: 'Other' },
    { name: 'Distribution', value: 'Distribution' },
    { name: 'Sto', value: 'Sto' },
    { name: 'Exchange', value: 'Exchange' }
  ],
  required: true,
  displayOptions: {
    show: {
      resource: ['venue'],
      operation: ['createVenue']
    }
  },
  default: 'Other',
  description: 'Type of the venue'
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: [
    { name: 'Unknown', value: 'Unknown' },
    { name: 'Pending', value: 'Pending' },
    { name: 'Success', value: 'Success' },
    { name: 'Failed', value: 'Failed' },
    { name: 'Rejected', value: 'Rejected' }
  ],
  displayOptions: {
    show: {
      resource: ['venue'],
      operation: ['getVenueInstructions']
    }
  },
  default: '',
  description: 'Filter instructions by status'
},
{
  displayName: 'Instruction Types',
  name: 'types',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['venue'],
      operation: ['allowInstructionTypes']
    }
  },
  default: '',
  description: 'Comma-separated list of instruction types to allow'
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identities'],
      operation: ['getIdentity'],
    },
  },
  default: '',
  description: 'The decentralized identifier (DID) of the identity',
},
{
  displayName: 'Size',
  name: 'size',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['identities'],
      operation: ['listIdentities'],
    },
  },
  default: 10,
  description: 'Number of identities to return per page',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['identities'],
      operation: ['listIdentities'],
    },
  },
  default: '',
  description: 'Starting point for pagination',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identities'],
      operation: ['getIdentityPortfolios'],
    },
  },
  default: '',
  description: 'The decentralized identifier (DID) of the identity',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identities'],
      operation: ['getIdentityClaims'],
    },
  },
  default: '',
  description: 'The decentralized identifier (DID) of the identity',
},
{
  displayName: 'Claim Types',
  name: 'claimTypes',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['identities'],
      operation: ['getIdentityClaims'],
    },
  },
  default: '',
  description: 'Comma-separated list of claim types to filter by',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['identities'],
      operation: ['getIdentityInstructions'],
    },
  },
  default: '',
  description: 'The decentralized identifier (DID) of the identity',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['identities'],
      operation: ['getIdentityInstructions'],
    },
  },
  options: [
    {
      name: 'Pending',
      value: 'pending',
    },
    {
      name: 'Success',
      value: 'success',
    },
    {
      name: 'Failed',
      value: 'failed',
    },
  ],
  default: '',
  description: 'Filter instructions by status',
},
{
  displayName: 'Ticker',
  name: 'ticker',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAsset'],
    },
  },
  default: '',
  description: 'The asset ticker symbol',
},
{
  displayName: 'Size',
  name: 'size',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['listAssets'],
    },
  },
  default: 25,
  description: 'Number of results to return',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['listAssets'],
    },
  },
  default: '',
  description: 'Start key for pagination',
},
{
  displayName: 'Owner',
  name: 'owner',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['listAssets'],
    },
  },
  default: '',
  description: 'Filter assets by owner address',
},
{
  displayName: 'Ticker',
  name: 'ticker',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetHolders'],
    },
  },
  default: '',
  description: 'The asset ticker symbol',
},
{
  displayName: 'Size',
  name: 'size',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetHolders'],
    },
  },
  default: 25,
  description: 'Number of results to return',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetHolders'],
    },
  },
  default: '',
  description: 'Start key for pagination',
},
{
  displayName: 'Ticker',
  name: 'ticker',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: '',
  description: 'The asset ticker symbol',
},
{
  displayName: 'Size',
  name: 'size',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: 25,
  description: 'Number of results to return',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetTransactions'],
    },
  },
  default: '',
  description: 'Start key for pagination',
},
{
  displayName: 'Ticker',
  name: 'ticker',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssetDocuments'],
    },
  },
  default: '',
  description: 'The asset ticker symbol',
},
{
  displayName: 'Ticker',
  name: 'ticker',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getComplianceRequirements'],
    },
  },
  default: '',
  description: 'The asset ticker symbol',
},
{
  displayName: 'DID',
  name: 'did',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['portfolios'],
      operation: ['getPortfolio', 'getPortfoliosByDid', 'getPortfolioMovements', 'getPortfolioBalances'],
    },
  },
  default: '',
  description: 'The identity DID (Decentralized Identifier)',
},
{
  displayName: 'Portfolio ID',
  name: 'portfolioId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['portfolios'],
      operation: ['getPortfolio', 'getPortfolioMovements', 'getPortfolioBalances'],
    },
  },
  default: '',
  description: 'The portfolio identifier',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['portfolios'],
      operation: ['getPortfolioMovements'],
    },
  },
  default: '',
  description: 'Filter movements by blockchain address',
},
{
  displayName: 'Ticker',
  name: 'ticker',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['portfolios'],
      operation: ['getPortfolioMovements'],
    },
  },
  default: '',
  description: 'Filter movements by asset ticker',
},
{
  displayName: 'Settlement ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['settlements'],
      operation: ['getSettlement', 'getSettlementLegs', 'getSettlementAffirmations'],
    },
  },
  default: '',
  description: 'The settlement instruction ID',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['settlements'],
      operation: ['listSettlements'],
    },
  },
  options: [
    {
      name: 'Pending',
      value: 'pending',
    },
    {
      name: 'Affirmed',
      value: 'affirmed',
    },
    {
      name: 'Executed',
      value: 'executed',
    },
    {
      name: 'Failed',
      value: 'failed',
    },
    {
      name: 'Rejected',
      value: 'rejected',
    },
  ],
  default: '',
  description: 'Filter by settlement status',
},
{
  displayName: 'Involved Party',
  name: 'involvedParty',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['settlements'],
      operation: ['listSettlements'],
    },
  },
  default: '',
  description: 'Filter by involved party DID or address',
},
{
  displayName: 'Page Size',
  name: 'size',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['settlements'],
      operation: ['listSettlements'],
    },
  },
  default: 25,
  description: 'Number of results to return per page (1-100)',
  typeOptions: {
    minValue: 1,
    maxValue: 100,
  },
},
{
  displayName: 'Start Key',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['settlements'],
      operation: ['listSettlements'],
    },
  },
  default: '',
  description: 'Pagination start key from previous response',
},
{
  displayName: 'Instruction ID',
  name: 'instructionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['instructions'],
      operation: ['getInstruction'],
    },
  },
  default: '',
  description: 'The ID of the instruction to retrieve',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['instructions'],
      operation: ['listInstructions'],
    },
  },
  options: [
    {
      name: 'Pending',
      value: 'pending',
    },
    {
      name: 'Failed',
      value: 'failed',
    },
    {
      name: 'Success',
      value: 'success',
    },
    {
      name: 'Rejected',
      value: 'rejected',
    },
  ],
  default: '',
  description: 'Filter instructions by status',
},
{
  displayName: 'Size',
  name: 'size',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['instructions'],
      operation: ['listInstructions'],
    },
  },
  default: 10,
  description: 'Number of instructions to return',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['instructions'],
      operation: ['listInstructions'],
    },
  },
  default: '',
  description: 'Pagination start cursor',
},
{
  displayName: 'Instruction ID',
  name: 'instructionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['instructions'],
      operation: ['getInstructionLegs'],
    },
  },
  default: '',
  description: 'The ID of the instruction to get legs for',
},
{
  displayName: 'Instruction ID',
  name: 'instructionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['instructions'],
      operation: ['getInstructionAffirmations'],
    },
  },
  default: '',
  description: 'The ID of the instruction to get affirmations for',
},
{
  displayName: 'Instruction ID',
  name: 'instructionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['instructions'],
      operation: ['getInstructionEvents'],
    },
  },
  default: '',
  description: 'The ID of the instruction to get events for',
},
{
  displayName: 'Target',
  name: 'target',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['claims'],
      operation: ['listClaims'],
    },
  },
  default: '',
  description: 'Filter claims by target identity',
},
{
  displayName: 'Issuer',
  name: 'issuer',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['claims'],
      operation: ['listClaims'],
    },
  },
  default: '',
  description: 'Filter claims by issuer identity',
},
{
  displayName: 'Claim Types',
  name: 'claimTypes',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['claims'],
      operation: ['listClaims', 'getClaimsByTarget'],
    },
  },
  default: '',
  description: 'Comma-separated list of claim types to filter by',
},
{
  displayName: 'Size',
  name: 'size',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['claims'],
      operation: ['listClaims', 'getClaimIssuers'],
    },
  },
  default: 25,
  description: 'Number of results to return',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['claims'],
      operation: ['listClaims', 'getClaimIssuers'],
    },
  },
  default: '',
  description: 'Starting point for pagination',
},
{
  displayName: 'Target Identity',
  name: 'targetIdentity',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['claims'],
      operation: ['getClaimsByTarget'],
    },
  },
  default: '',
  description: 'The target identity to get claims for',
},
{
  displayName: 'Include Expired',
  name: 'includeExpired',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['claims'],
      operation: ['getClaimsByTarget'],
    },
  },
  default: false,
  description: 'Whether to include expired claims in the results',
},
{
  displayName: 'Block ID',
  name: 'blockId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlock'],
    },
  },
  default: '',
  description: 'The block hash or block number to retrieve',
},
{
  displayName: 'Block ID',
  name: 'blockId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['getBlockTransactions'],
    },
  },
  default: '',
  description: 'The block hash or block number to get transactions from',
},
{
  displayName: 'Page Size',
  name: 'size',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['listBlocks'],
    },
  },
  default: 25,
  typeOptions: {
    minValue: 1,
    maxValue: 1000,
  },
  description: 'Number of blocks to return per page',
},
{
  displayName: 'Start Block',
  name: 'start',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['blocks'],
      operation: ['listBlocks'],
    },
  },
  default: '',
  description: 'Starting block hash or number for pagination',
},
{
  displayName: 'Transaction Hash',
  name: 'txHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The transaction hash to retrieve details for',
},
{
  displayName: 'Block Number',
  name: 'blockNumber',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['listTransactions'],
    },
  },
  default: '',
  description: 'Filter transactions by block number',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['listTransactions'],
    },
  },
  default: '',
  description: 'Filter transactions by blockchain address',
},
{
  displayName: 'Size',
  name: 'size',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['listTransactions'],
    },
  },
  default: 20,
  description: 'Number of transactions to return (max 100)',
},
{
  displayName: 'Start',
  name: 'start',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['listTransactions'],
    },
  },
  default: 0,
  description: 'Starting index for pagination',
},
{
  displayName: 'Transaction Hash',
  name: 'txHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transactions'],
      operation: ['getTransactionEvents'],
    },
  },
  default: '',
  description: 'The transaction hash to retrieve events for',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'asset':
        return [await executeAssetOperations.call(this, items)];
      case 'identity':
        return [await executeIdentityOperations.call(this, items)];
      case 'portfolio':
        return [await executePortfolioOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'compliance':
        return [await executeComplianceOperations.call(this, items)];
      case 'venue':
        return [await executeVenueOperations.call(this, items)];
      case 'identities':
        return [await executeIdentitiesOperations.call(this, items)];
      case 'assets':
        return [await executeAssetsOperations.call(this, items)];
      case 'portfolios':
        return [await executePortfoliosOperations.call(this, items)];
      case 'settlements':
        return [await executeSettlementsOperations.call(this, items)];
      case 'instructions':
        return [await executeInstructionsOperations.call(this, items)];
      case 'claims':
        return [await executeClaimsOperations.call(this, items)];
      case 'blocks':
        return [await executeBlocksOperations.call(this, items)];
      case 'transactions':
        return [await executeTransactionsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAssetOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('polymeshApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAsset': {
          const ticker = this.getNodeParameter('ticker', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets/${ticker}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllAssets': {
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: {
              limit,
              offset,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createAsset': {
          const name = this.getNodeParameter('name', i) as string;
          const ticker = this.getNodeParameter('ticker', i) as string;
          const divisible = this.getNodeParameter('divisible', i) as boolean;
          const assetType = this.getNodeParameter('assetType', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/assets/create`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              name,
              ticker,
              divisible,
              assetType,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateAsset': {
          const ticker = this.getNodeParameter('ticker', i) as string;
          const name = this.getNodeParameter('name', i) as string;
          const fundingRound = this.getNodeParameter('fundingRound', i) as string;
          
          const body: any = {};
          if (name) body.name = name;
          if (fundingRound) body.fundingRound = fundingRound;
          
          const options: any = {
            method: 'PATCH',
            url: `${credentials.baseUrl}/assets/${ticker}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'freezeAsset': {
          const ticker = this.getNodeParameter('ticker', i) as string;
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/assets/${ticker}/freeze`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'unfreezeAsset': {
          const ticker = this.getNodeParameter('ticker', i) as string;
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/assets/${ticker}/unfreeze`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeIdentityOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('polymeshApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getIdentity': {
          const did = this.getNodeParameter('did', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/identities/${did}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json