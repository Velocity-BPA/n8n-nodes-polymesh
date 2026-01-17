/**
 * Polymesh Trigger Node
 * 
 * Real-time event monitoring for the Polymesh blockchain.
 * Uses Substrate subscriptions to listen for on-chain events.
 */

import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeOperationError,
} from 'n8n-workflow';

import { PolymeshSubscriptionClient, PolymeshEventType } from './transport/subscriptionClient';
import { getPolymeshClient } from './transport/polymeshClient';

export class PolymeshTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Polymesh Trigger',
		name: 'polymeshTrigger',
		icon: 'file:polymesh.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["eventCategory"] + "/" + $parameter["eventType"]}}',
		description: 'Triggers when Polymesh blockchain events occur',
		defaults: {
			name: 'Polymesh Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'polymeshNetwork',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event Category',
				name: 'eventCategory',
				type: 'options',
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'POLYX transfers and balance changes',
					},
					{
						name: 'Asset',
						value: 'asset',
						description: 'Token creation, issuance, and transfers',
					},
					{
						name: 'Block',
						value: 'block',
						description: 'New block finalization',
					},
					{
						name: 'Compliance',
						value: 'compliance',
						description: 'Compliance rule changes and failures',
					},
					{
						name: 'Corporate Actions',
						value: 'corporateActions',
						description: 'Dividends, ballots, and distributions',
					},
					{
						name: 'Governance',
						value: 'governance',
						description: 'PIP proposals and votes',
					},
					{
						name: 'Identity',
						value: 'identity',
						description: 'CDD claims and identity changes',
					},
					{
						name: 'Portfolio',
						value: 'portfolio',
						description: 'Portfolio creation and asset movements',
					},
					{
						name: 'Settlement',
						value: 'settlement',
						description: 'Instructions and affirmations',
					},
				],
				default: 'asset',
				required: true,
			},
			// Identity events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['identity'],
					},
				},
				options: [
					{ name: 'Identity Created', value: 'DidCreated' },
					{ name: 'CDD Claim Added', value: 'CddClaimAdded' },
					{ name: 'CDD Claim Revoked', value: 'CddClaimRevoked' },
					{ name: 'Secondary Key Added', value: 'SecondaryKeyAdded' },
					{ name: 'Secondary Key Removed', value: 'SecondaryKeyRemoved' },
					{ name: 'Secondary Keys Frozen', value: 'SecondaryKeysFrozen' },
					{ name: 'Secondary Keys Unfrozen', value: 'SecondaryKeysUnfrozen' },
					{ name: 'Authorization Added', value: 'AuthorizationAdded' },
					{ name: 'Authorization Consumed', value: 'AuthorizationConsumed' },
					{ name: 'Authorization Rejected', value: 'AuthorizationRejected' },
					{ name: 'Primary Key Updated', value: 'PrimaryKeyUpdated' },
				],
				default: 'DidCreated',
				required: true,
			},
			// Asset events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['asset'],
					},
				},
				options: [
					{ name: 'Asset Created', value: 'AssetCreated' },
					{ name: 'Tokens Issued', value: 'Issued' },
					{ name: 'Tokens Redeemed', value: 'Redeemed' },
					{ name: 'Asset Frozen', value: 'AssetFrozen' },
					{ name: 'Asset Unfrozen', value: 'AssetUnfrozen' },
					{ name: 'Transfer', value: 'Transfer' },
					{ name: 'Document Added', value: 'DocumentAdded' },
					{ name: 'Document Removed', value: 'DocumentRemoved' },
					{ name: 'Identifier Registered', value: 'IdentifierRegistered' },
					{ name: 'Controller Transfer', value: 'ControllerTransfer' },
					{ name: 'Custom Asset Type Registered', value: 'CustomAssetTypeRegistered' },
				],
				default: 'AssetCreated',
				required: true,
			},
			// Settlement events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['settlement'],
					},
				},
				options: [
					{ name: 'Venue Created', value: 'VenueCreated' },
					{ name: 'Venue Updated', value: 'VenueUpdated' },
					{ name: 'Instruction Created', value: 'InstructionCreated' },
					{ name: 'Instruction Affirmed', value: 'InstructionAffirmed' },
					{ name: 'Affirmation Withdrawn', value: 'AffirmationWithdrawn' },
					{ name: 'Instruction Rejected', value: 'InstructionRejected' },
					{ name: 'Instruction Executed', value: 'InstructionExecuted' },
					{ name: 'Instruction Failed', value: 'InstructionFailed' },
					{ name: 'Leg Failed', value: 'LegFailed' },
					{ name: 'Settlement Manually Executed', value: 'SettlementManuallyExecuted' },
				],
				default: 'InstructionCreated',
				required: true,
			},
			// Portfolio events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['portfolio'],
					},
				},
				options: [
					{ name: 'Portfolio Created', value: 'PortfolioCreated' },
					{ name: 'Portfolio Deleted', value: 'PortfolioDeleted' },
					{ name: 'Portfolio Renamed', value: 'PortfolioRenamed' },
					{ name: 'Assets Moved', value: 'MovedBetweenPortfolios' },
					{ name: 'Custodian Changed', value: 'PortfolioCustodianChanged' },
				],
				default: 'PortfolioCreated',
				required: true,
			},
			// Corporate actions events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['corporateActions'],
					},
				},
				options: [
					{ name: 'Corporate Action Created', value: 'CAInitiated' },
					{ name: 'Dividend Announced', value: 'CABenefitClaimed' },
					{ name: 'Ballot Created', value: 'Created' },
					{ name: 'Vote Cast', value: 'VoteCast' },
					{ name: 'Ballot Closed', value: 'RangeChanged' },
					{ name: 'Checkpoint Created', value: 'CheckpointCreated' },
					{ name: 'Schedule Created', value: 'ScheduleCreated' },
				],
				default: 'CAInitiated',
				required: true,
			},
			// Compliance events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['compliance'],
					},
				},
				options: [
					{ name: 'Claim Added', value: 'ClaimAdded' },
					{ name: 'Claim Revoked', value: 'ClaimRevoked' },
					{ name: 'Compliance Requirement Created', value: 'ComplianceRequirementCreated' },
					{ name: 'Compliance Requirement Removed', value: 'ComplianceRequirementRemoved' },
					{ name: 'Asset Compliance Replaced', value: 'AssetComplianceReplaced' },
					{ name: 'Asset Compliance Reset', value: 'AssetComplianceReset' },
					{ name: 'Asset Compliance Paused', value: 'AssetCompliancePaused' },
					{ name: 'Asset Compliance Resumed', value: 'AssetComplianceResumed' },
					{ name: 'Trusted Default Claim Issuer Added', value: 'TrustedDefaultClaimIssuerAdded' },
					{ name: 'Trusted Default Claim Issuer Removed', value: 'TrustedDefaultClaimIssuerRemoved' },
				],
				default: 'ClaimAdded',
				required: true,
			},
			// Account events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['account'],
					},
				},
				options: [
					{ name: 'Balance Transfer', value: 'Transfer' },
					{ name: 'Balance Set', value: 'BalanceSet' },
					{ name: 'Endowed', value: 'Endowed' },
					{ name: 'Subsidy Added', value: 'SubsidyAdded' },
					{ name: 'Subsidy Removed', value: 'SubsidyRemoved' },
				],
				default: 'Transfer',
				required: true,
			},
			// Governance events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['governance'],
					},
				},
				options: [
					{ name: 'PIP Proposed', value: 'ProposalCreated' },
					{ name: 'PIP State Changed', value: 'ProposalStateUpdated' },
					{ name: 'Vote Cast', value: 'Voted' },
					{ name: 'PIP Executed', value: 'PipClosed' },
					{ name: 'Active PIP Limit Changed', value: 'ActivePipLimitChanged' },
					{ name: 'Snapshot Taken', value: 'SnapshotTaken' },
				],
				default: 'ProposalCreated',
				required: true,
			},
			// Block events
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['block'],
					},
				},
				options: [
					{ name: 'New Block', value: 'NewBlock' },
					{ name: 'Block Finalized', value: 'BlockFinalized' },
				],
				default: 'NewBlock',
				required: true,
			},
			// Filter options
			{
				displayName: 'Filter Options',
				name: 'filterOptions',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Asset Ticker',
						name: 'ticker',
						type: 'string',
						default: '',
						placeholder: 'ACME',
						description: 'Filter events for a specific asset ticker',
					},
					{
						displayName: 'DID',
						name: 'did',
						type: 'string',
						default: '',
						placeholder: '0x...',
						description: 'Filter events for a specific identity (DID)',
					},
					{
						displayName: 'Venue ID',
						name: 'venueId',
						type: 'string',
						default: '',
						description: 'Filter settlement events for a specific venue',
					},
					{
						displayName: 'Instruction ID',
						name: 'instructionId',
						type: 'string',
						default: '',
						description: 'Filter settlement events for a specific instruction',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const eventCategory = this.getNodeParameter('eventCategory') as string;
		const eventType = this.getNodeParameter('eventType') as string;
		const filterOptions = this.getNodeParameter('filterOptions', {}) as {
			ticker?: string;
			did?: string;
			venueId?: string;
			instructionId?: string;
		};

		// Get Polymesh client
		let polymesh: any;
		try {
			polymesh = await getPolymeshClient.call(this as any);
		} catch (error: any) {
			throw new NodeOperationError(
				this.getNode(),
				`Failed to connect to Polymesh: ${error.message}`,
			);
		}

		// Create subscription client
		const subscriptionClient = new PolymeshSubscriptionClient(polymesh);

		// Store subscription ID for cleanup
		let subscriptionId: string | null = null;

		// Event handler
		const handleEvent = (event: any) => {
			// Apply filters
			if (filterOptions.ticker && event.ticker !== filterOptions.ticker) {
				return;
			}
			if (filterOptions.did && event.did !== filterOptions.did && event.target !== filterOptions.did) {
				return;
			}
			if (filterOptions.venueId && event.venueId?.toString() !== filterOptions.venueId) {
				return;
			}
			if (filterOptions.instructionId && event.instructionId?.toString() !== filterOptions.instructionId) {
				return;
			}

			// Emit event to workflow
			this.emit([
				this.helpers.returnJsonArray({
					eventCategory,
					eventType,
					timestamp: new Date().toISOString(),
					blockNumber: event.blockNumber,
					blockHash: event.blockHash,
					extrinsicIndex: event.extrinsicIndex,
					data: event,
				}),
			]);
		};

		// Start subscription based on category
		const startSubscription = async () => {
			try {
				switch (eventCategory) {
					case 'block':
						if (eventType === 'NewBlock') {
							subscriptionId = await subscriptionClient.subscribeToBlocks((event: any) => {
								handleEvent({
									blockNumber: event.blockNumber,
									blockHash: event.blockHash,
									parentHash: event.data?.parentHash,
									timestamp: new Date().toISOString(),
								});
							});
						} else {
							// Block finalized - use generic event subscription
							subscriptionId = await subscriptionClient.subscribeToEvents(
								[eventType as PolymeshEventType],
								handleEvent,
							);
						}
						break;
					
					case 'account':
						if (filterOptions.did || filterOptions.ticker) {
							// Subscribe to balance changes for specific account
							const address = filterOptions.did || filterOptions.ticker || '';
							subscriptionId = await subscriptionClient.subscribeToBalanceChanges(
								address,
								(event: any) => {
									handleEvent({
										address,
										free: event.data?.free,
										locked: event.data?.reserved,
										total: event.data?.free,
									});
								},
							);
						} else {
							subscriptionId = await subscriptionClient.subscribeToEvents(
								[eventType as PolymeshEventType],
								handleEvent,
							);
						}
						break;
					
					default:
						// Generic event subscription
						subscriptionId = await subscriptionClient.subscribeToEvents(
							[eventType as PolymeshEventType],
							handleEvent,
						);
				}
			} catch (error: any) {
				throw new NodeOperationError(
					this.getNode(),
					`Failed to start subscription: ${error.message}`,
				);
			}
		};

		// Start the subscription
		await startSubscription();

		// Return cleanup function
		const closeFunction = async () => {
			if (subscriptionId) {
				await subscriptionClient.unsubscribe(subscriptionId);
			}
		};

		return {
			closeFunction,
		};
	}
}
