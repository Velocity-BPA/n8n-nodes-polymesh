/**
 * Polymesh Node
 * 
 * n8n community node for interacting with the Polymesh blockchain.
 * Polymesh is an institutional-grade blockchain for security tokens,
 * with built-in identity, compliance, and settlement capabilities.
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// Import descriptions
import { identityOperations, identityFields } from './actions/identity/identity.description';
import { accountOperations, accountFields } from './actions/account/account.description';
import { assetOperations, assetFields } from './actions/asset/asset.description';
import { complianceOperations, complianceFields } from './actions/compliance/compliance.description';
import { claimsOperations, claimsFields } from './actions/claims/claims.description';
import { settlementOperations, settlementFields } from './actions/settlement/settlement.description';
import { portfolioOperations, portfolioFields } from './actions/portfolio/portfolio.description';
import { corporateActionsOperations, corporateActionsFields } from './actions/corporateActions/corporateActions.description';
import { stoOperations, stoFields } from './actions/sto/sto.description';
import { statisticsOperations, statisticsFields } from './actions/statistics/statistics.description';
import { confidentialAssetsOperations, confidentialAssetsFields } from './actions/confidentialAssets/confidentialAssets.description';
import { multiSigOperations, multiSigFields } from './actions/multiSig/multiSig.description';
import { authorizationsOperations, authorizationsFields } from './actions/authorizations/authorizations.description';
import { governanceOperations, governanceFields } from './actions/governance/governance.description';
import { checkpointOperations, checkpointFields } from './actions/checkpoint/checkpoint.description';
import { externalAgentsOperations, externalAgentsFields } from './actions/externalAgents/externalAgents.description';
import { nftOperations, nftFields } from './actions/nft/nft.description';
import { utilityOperations, utilityFields } from './actions/utility/utility.description';

// Import operations
import { executeIdentityOperation } from './actions/identity/identity.operations';
import { executeAccountOperation } from './actions/account/account.operations';
import { executeAssetOperation } from './actions/asset/asset.operations';
import { executeComplianceOperation } from './actions/compliance/compliance.operations';
import { executeClaimsOperation } from './actions/claims/claims.operations';
import { executeSettlementOperation } from './actions/settlement/settlement.operations';
import { executePortfolioOperation } from './actions/portfolio/portfolio.operations';
import { executeCorporateActionsOperation } from './actions/corporateActions/corporateActions.operations';
import { executeStoOperation } from './actions/sto/sto.operations';
import { executeStatisticsOperation } from './actions/statistics/statistics.operations';
import { executeConfidentialAssetsOperation } from './actions/confidentialAssets/confidentialAssets.operations';
import { executeMultiSigOperation } from './actions/multiSig/multiSig.operations';
import { executeAuthorizationsOperation } from './actions/authorizations/authorizations.operations';
import { executeGovernanceOperation } from './actions/governance/governance.operations';
import { executeCheckpointOperation } from './actions/checkpoint/checkpoint.operations';
import { executeExternalAgentsOperation } from './actions/externalAgents/externalAgents.operations';
import { executeNftOperation } from './actions/nft/nft.operations';
import { executeUtilityOperation } from './actions/utility/utility.operations';

export class Polymesh implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Polymesh',
		name: 'polymesh',
		icon: 'file:polymesh.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Polymesh blockchain for security tokens, identity, compliance, and settlement',
		defaults: {
			name: 'Polymesh',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'polymeshNetwork',
				required: true,
			},
			{
				name: 'polymeshMiddleware',
				required: false,
			},
			{
				name: 'cddProvider',
				required: false,
			},
		],
		properties: [
			// Resource selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage POLYX balances and account operations',
					},
					{
						name: 'Asset',
						value: 'asset',
						description: 'Create and manage security tokens',
					},
					{
						name: 'Authorizations',
						value: 'authorizations',
						description: 'Manage pending authorizations',
					},
					{
						name: 'Checkpoint',
						value: 'checkpoint',
						description: 'Create and query balance snapshots',
					},
					{
						name: 'Claims',
						value: 'claims',
						description: 'Manage identity claims and attestations',
					},
					{
						name: 'Compliance',
						value: 'compliance',
						description: 'Configure transfer compliance rules',
					},
					{
						name: 'Confidential Assets',
						value: 'confidentialAssets',
						description: 'Privacy-preserving asset transfers',
					},
					{
						name: 'Corporate Actions',
						value: 'corporateActions',
						description: 'Dividends, ballots, and distributions',
					},
					{
						name: 'External Agents',
						value: 'externalAgents',
						description: 'Manage delegated asset permissions',
					},
					{
						name: 'Governance',
						value: 'governance',
						description: 'Query PIPs and network governance',
					},
					{
						name: 'Identity',
						value: 'identity',
						description: 'Manage CDD identities and keys',
					},
					{
						name: 'Multi-Sig',
						value: 'multiSig',
						description: 'Multi-signature account operations',
					},
					{
						name: 'NFT',
						value: 'nft',
						description: 'Non-fungible security tokens',
					},
					{
						name: 'Portfolio',
						value: 'portfolio',
						description: 'Manage asset portfolios',
					},
					{
						name: 'Settlement',
						value: 'settlement',
						description: 'Create and execute settlement instructions',
					},
					{
						name: 'Statistics',
						value: 'statistics',
						description: 'Asset statistics and transfer restrictions',
					},
					{
						name: 'STO',
						value: 'sto',
						description: 'Security Token Offering operations',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Helper functions and network info',
					},
				],
				default: 'identity',
			},
			// All operations (spread arrays where needed)
			identityOperations,
			...accountOperations,
			...assetOperations,
			...complianceOperations,
			...claimsOperations,
			...settlementOperations,
			portfolioOperations,
			...corporateActionsOperations,
			...stoOperations,
			...statisticsOperations,
			confidentialAssetsOperations,
			...multiSigOperations,
			...authorizationsOperations,
			...governanceOperations,
			...checkpointOperations,
			...externalAgentsOperations,
			...nftOperations,
			...utilityOperations,
			// All fields
			...identityFields,
			...accountFields,
			...assetFields,
			...complianceFields,
			...claimsFields,
			...settlementFields,
			...portfolioFields,
			...corporateActionsFields,
			...stoFields,
			...statisticsFields,
			...confidentialAssetsFields,
			...multiSigFields,
			...authorizationsFields,
			...governanceFields,
			...checkpointFields,
			...externalAgentsFields,
			...nftFields,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'identity':
						result = await executeIdentityOperation.call(this, operation as any, i);
						break;
					case 'account':
						result = await executeAccountOperation.call(this, operation, i);
						break;
					case 'asset':
						result = await executeAssetOperation.call(this, operation, i);
						break;
					case 'compliance':
						result = await executeComplianceOperation.call(this, operation, i);
						break;
					case 'claims':
						result = await executeClaimsOperation.call(this, operation, i);
						break;
					case 'settlement':
						result = await executeSettlementOperation.call(this, operation, i);
						break;
					case 'portfolio':
						result = await executePortfolioOperation.call(this, operation, i);
						break;
					case 'corporateActions':
						result = await executeCorporateActionsOperation.call(this, operation, i);
						break;
					case 'sto':
						result = await executeStoOperation.call(this, operation, i);
						break;
					case 'statistics':
						result = await executeStatisticsOperation.call(this, operation, i);
						break;
					case 'confidentialAssets':
						result = await executeConfidentialAssetsOperation.call(this, operation, i);
						break;
					case 'multiSig':
						result = await executeMultiSigOperation.call(this, operation, i);
						break;
					case 'authorizations':
						result = await executeAuthorizationsOperation.call(this, operation, i);
						break;
					case 'governance':
						result = await executeGovernanceOperation.call(this, operation, i);
						break;
					case 'checkpoint':
						result = await executeCheckpointOperation.call(this, operation, i);
						break;
					case 'externalAgents':
						result = await executeExternalAgentsOperation.call(this, operation, i);
						break;
					case 'nft':
						result = await executeNftOperation.call(this, operation, i);
						break;
					case 'utility':
						result = await executeUtilityOperation.call(this, operation, i);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown resource: ${resource}`,
							{ itemIndex: i },
						);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							resource,
							operation,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
