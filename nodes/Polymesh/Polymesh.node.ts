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
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
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
        default: 'identities',
      },
      // Operation dropdowns per resource
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
      // Parameter definitions
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

async function executeIdentitiesOperations(
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
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'listIdentities': {
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as string;
          
          const queryParams: any = {};
          if (size) queryParams.size = size;
          if (start) queryParams.start = start;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/identities`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: queryParams,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getIdentityPortfolios': {
          const did = this.getNodeParameter('did', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/identities/${did}/portfolios`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getIdentityClaims': {
          const did = this.getNodeParameter('did', i) as string;
          const claimTypes = this.getNodeParameter('claimTypes', i) as string;
          
          const queryParams: any = {};
          if (claimTypes) {
            queryParams.claimTypes = claimTypes;
          }
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/identities/${did}/claims`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: queryParams,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getIdentityInstructions': {
          const did = this.getNodeParameter('did', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          
          const queryParams: any = {};
          if (status) {
            queryParams.status = status;
          }
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/identities/${did}/instructions`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: queryParams,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ 
        json: result, 
        pairedItem: { item: i } 
      });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  
  return returnData;
}

async function executeAssetsOperations(
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
              'Accept': 'application/json',
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listAssets': {
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as string;
          const owner = this.getNodeParameter('owner', i) as string;
          
          const queryParams = new URLSearchParams();
          if (size) queryParams.append('size', size.toString());
          if (start) queryParams.append('start', start);
          if (owner) queryParams.append('owner', owner);
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
            headers: {
              'Accept': 'application/json',
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAssetHolders': {
          const ticker = this.getNodeParameter('ticker', i) as string;
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as string;
          
          const queryParams = new URLSearchParams();
          if (size) queryParams.append('size', size.toString());
          if (start) queryParams.append('start', start);
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets/${ticker}/holders${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
            headers: {
              'Accept': 'application/json',
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAssetTransactions': {
          const ticker = this.getNodeParameter('ticker', i) as string;
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as string;
          
          const queryParams = new URLSearchParams();
          if (size) queryParams.append('size', size.toString());
          if (start) queryParams.append('start', start);
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets/${ticker}/transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
            headers: {
              'Accept': 'application/json',
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAssetDocuments': {
          const ticker = this.getNodeParameter('ticker', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets/${ticker}/documents`,
            headers: {
              'Accept': 'application/json',
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getComplianceRequirements': {
          const ticker = this.getNodeParameter('ticker', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets/${ticker}/compliance`,
            headers: {
              'Accept': 'application/json',
              'X-API-Key': credentials.apiKey,
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
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executePortfoliosOperations(
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
        case 'getPortfolio': {
          const did = this.getNodeParameter('did', i) as string;
          const portfolioId = this.getNodeParameter('portfolioId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/portfolios/${did}/${portfolioId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPortfoliosByDid': {
          const did = this.getNodeParameter('did', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/portfolios/${did}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPortfolioMovements': {
          const did = this.getNodeParameter('did', i) as string;
          const portfolioId = this.getNodeParameter('portfolioId', i) as string;
          const address = this.getNodeParameter('address', i, '') as string;
          const ticker = this.getNodeParameter('ticker', i, '') as string;

          const queryParams: string[] = [];
          if (address) {
            queryParams.push(`address=${encodeURIComponent(address)}`);
          }
          if (ticker) {
            queryParams.push(`ticker=${encodeURIComponent(ticker)}`);
          }

          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/portfolios/${did}/${portfolioId}/movements${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPortfolioBalances': {
          const did = this.getNodeParameter('did', i) as string;
          const portfolioId = this.getNodeParameter('portfolioId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/portfolios/${did}/${portfolioId}/balances`,
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
          throw new NodeOperationError(
            this.getNode(),
            `The operation "${operation}" is not supported!`,
          );
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { 
            error: error.message,
            operation,
            item: i,
          },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeSettlementsOperations(
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
        case 'getSettlement': {
          const id = this.getNodeParameter('id', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/settlements/${id}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'listSettlements': {
          const status = this.getNodeParameter('status', i) as string;
          const involvedParty = this.getNodeParameter('involvedParty', i) as string;
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as string;
          
          const queryParams: any = {};
          if (status) queryParams.status = status;
          if (involvedParty) queryParams.involvedParty = involvedParty;
          if (size) queryParams.size = size.toString();
          if (start) queryParams.start = start;
          
          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString()
            : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/settlements${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getSettlementLegs': {
          const id = this.getNodeParameter('id', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/settlements/${id}/legs`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getSettlementAffirmations': {
          const id = this.getNodeParameter('id', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/settlements/${id}/affirmations`,
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
      if (error.httpCode) {
        throw new NodeApiError(this.getNode(), error);
      }
      
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  
  return returnData;
}

async function executeInstructionsOperations(
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
        case 'getInstruction': {
          const instructionId = this.getNodeParameter('instructionId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/instructions/${instructionId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'listInstructions': {
          const status = this.getNodeParameter('status', i) as string;
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as string;
          
          const queryParams: string[] = [];
          if (status) queryParams.push(`status=${encodeURIComponent(status)}`);
          if (size) queryParams.push(`size=${size}`);
          if (start) queryParams.push(`start=${encodeURIComponent(start)}`);
          
          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/instructions${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getInstructionLegs': {
          const instructionId = this.getNodeParameter('instructionId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/instructions/${instructionId}/legs`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getInstructionAffirmations': {
          const instructionId = this.getNodeParameter('instructionId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/instructions/${instructionId}/affirmations`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getInstructionEvents': {
          const instructionId = this.getNodeParameter('instructionId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/instructions/${instructionId}/events`,
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
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        } else {
          throw new NodeOperationError(this.getNode(), error.message);
        }
      }
    }
  }
  
  return returnData;
}

async function executeClaimsOperations(
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
        case 'listClaims': {
          const target = this.getNodeParameter('target', i) as string;
          const issuer = this.getNodeParameter('issuer', i) as string;
          const claimTypes = this.getNodeParameter('claimTypes', i) as string;
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as string;

          const queryParams: any = {};
          if (target) queryParams.target = target;
          if (issuer) queryParams.issuer = issuer;
          if (claimTypes) queryParams.claimTypes = claimTypes;
          if (size) queryParams.size = size;
          if (start) queryParams.start = start;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/claims${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getClaimsByTarget': {
          const targetIdentity = this.getNodeParameter('targetIdentity', i) as string;
          const claimTypes = this.getNodeParameter('claimTypes', i) as string;
          const includeExpired = this.getNodeParameter('includeExpired', i) as boolean;

          const queryParams: any = {};
          if (claimTypes) queryParams.claimTypes = claimTypes;
          if (includeExpired) queryParams.includeExpired = includeExpired;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/claims/${targetIdentity}${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getClaimIssuers': {
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as string;

          const queryParams: any = {};
          if (size) queryParams.size = size;
          if (start) queryParams.start = start;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/claims/issuers${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
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
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeBlocksOperations(
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
        case 'getLatestBlock': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/latest`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlock': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          
          if (!blockId) {
            throw new NodeOperationError(this.getNode(), 'Block ID is required for getBlock operation');
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/${blockId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listBlocks': {
          const size = this.getNodeParameter('size', i, 25) as number;
          const start = this.getNodeParameter('start', i, '') as string;

          const queryParams: string[] = [];
          queryParams.push(`size=${size}`);
          
          if (start) {
            queryParams.push(`start=${start}`);
          }

          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockTransactions': {
          const blockId = this.getNodeParameter('blockId', i) as string;
          
          if (!blockId) {
            throw new NodeOperationError(this.getNode(), 'Block ID is required for getBlockTransactions operation');
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/blocks/${blockId}/transactions`,
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

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (error.httpCode) {
        throw new NodeApiError(this.getNode(), error, { itemIndex: i });
      }

      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
      }
    }
  }

  return returnData;
}

async function executeTransactionsOperations(
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
        case 'getTransaction': {
          const txHash = this.getNodeParameter('txHash', i) as string;
          
          if (!txHash) {
            throw new NodeOperationError(this.getNode(), 'Transaction hash is required');
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${txHash}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'listTransactions': {
          const blockNumber = this.getNodeParameter('blockNumber', i) as number;
          const address = this.getNodeParameter('address', i) as string;
          const size = this.getNodeParameter('size', i) as number;
          const start = this.getNodeParameter('start', i) as number;

          const queryParams: any = {};
          if (blockNumber) queryParams.blockNumber = blockNumber;
          if (address) queryParams.address = address;
          if (size) queryParams.size = Math.min(size, 100);
          if (start) queryParams.start = start;

          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString()
            : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions${queryString}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactionEvents': {
          const txHash = this.getNodeParameter('txHash', i) as string;
          
          if (!txHash) {
            throw new NodeOperationError(this.getNode(), 'Transaction hash is required');
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${txHash}/events`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  
  return returnData;
}
