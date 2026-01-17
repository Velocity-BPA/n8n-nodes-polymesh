/**
 * Polymesh Subscription Client
 * 
 * Handles real-time event subscriptions for the Polymesh Trigger node.
 * Uses Substrate subscriptions via the Polymesh SDK.
 */

import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { PolymeshConnectionOptions, connectToPolymesh } from './polymeshClient';

// Event types that can be subscribed to
export enum PolymeshEventType {
	// Identity events
	IdentityCreated = 'identity.IdentityCreated',
	CddClaimAdded = 'identity.CddClaimAdded',
	CddClaimRevoked = 'identity.CddClaimRevoked',
	SecondaryKeyAdded = 'identity.SecondaryKeyAdded',
	SecondaryKeyRemoved = 'identity.SecondaryKeyRemoved',
	AuthorizationAdded = 'identity.AuthorizationAdded',
	AuthorizationConsumed = 'identity.AuthorizationConsumed',
	
	// Asset events
	AssetCreated = 'asset.AssetCreated',
	TokensIssued = 'asset.Issued',
	TokensRedeemed = 'asset.Redeemed',
	AssetFrozen = 'asset.AssetFrozen',
	AssetUnfrozen = 'asset.AssetUnfrozen',
	ComplianceUpdated = 'complianceManager.ComplianceRequirementCreated',
	DocumentAdded = 'asset.DocumentAdded',
	TransferRestrictionChanged = 'statistics.TransferManagerAdded',
	
	// Settlement events
	VenueCreated = 'settlement.VenueCreated',
	InstructionCreated = 'settlement.InstructionCreated',
	InstructionAffirmed = 'settlement.InstructionAffirmed',
	InstructionRejected = 'settlement.InstructionRejected',
	InstructionExecuted = 'settlement.InstructionExecuted',
	InstructionFailed = 'settlement.FailedToExecuteInstruction',
	
	// Portfolio events
	PortfolioCreated = 'portfolio.PortfolioCreated',
	AssetsMoved = 'portfolio.MovedBetweenPortfolios',
	CustodyTransferred = 'portfolio.PortfolioCustodianChanged',
	
	// Corporate action events
	DividendAnnounced = 'capitalDistribution.Created',
	DividendPaid = 'capitalDistribution.BenefitClaimed',
	BallotCreated = 'corporateBallot.Created',
	VoteCast = 'corporateBallot.VoteCast',
	CheckpointCreated = 'checkpoint.CheckpointCreated',
	
	// Compliance events
	ClaimAdded = 'identity.ClaimAdded',
	ClaimRevoked = 'identity.ClaimRevoked',
	ComplianceRequirementAdded = 'complianceManager.ComplianceRequirementCreated',
	TransferBlocked = 'complianceManager.ComplianceRequirementRemoved',
	
	// Account events
	PolyxTransfer = 'balances.Transfer',
	BalanceChanged = 'balances.BalanceSet',
	SubsidyUsed = 'relayer.AcceptedPayingKey',
	
	// Governance events
	PipProposed = 'pips.ProposalCreated',
	PipVoted = 'pips.Voted',
	PipExecuted = 'pips.ProposalRefund',
	PipRejected = 'pips.ProposalRejected',
	
	// Block events
	NewBlock = 'system.NewBlock',
	NewFinality = 'system.Finalized',
}

// Subscription handler type
export type SubscriptionHandler = (event: PolymeshEvent) => void | Promise<void>;

// Polymesh event data
export interface PolymeshEvent {
	type: PolymeshEventType;
	blockNumber: number;
	blockHash: string;
	timestamp: Date;
	data: Record<string, unknown>;
	raw: unknown;
}

// Active subscription
export interface ActiveSubscription {
	id: string;
	eventType: PolymeshEventType;
	filter?: Record<string, unknown>;
	handler: SubscriptionHandler;
	unsubscribe: () => void;
}

/**
 * Subscription client for managing real-time event subscriptions
 */
export class PolymeshSubscriptionClient {
	private polymesh: Polymesh | null = null;
	private subscriptions = new Map<string, ActiveSubscription>();
	private connectionOptions: PolymeshConnectionOptions;
	
	constructor(options: PolymeshConnectionOptions) {
		this.connectionOptions = options;
	}
	
	/**
	 * Connect to Polymesh
	 */
	async connect(): Promise<void> {
		if (!this.polymesh) {
			this.polymesh = await connectToPolymesh(this.connectionOptions);
		}
	}
	
	/**
	 * Disconnect and clean up all subscriptions
	 */
	async disconnect(): Promise<void> {
		// Unsubscribe from all active subscriptions
		for (const [id, sub] of this.subscriptions) {
			try {
				sub.unsubscribe();
			} catch {
				// Ignore unsubscribe errors
			}
			this.subscriptions.delete(id);
		}
		
		// Disconnect from Polymesh
		if (this.polymesh) {
			try {
				await this.polymesh.disconnect();
			} catch {
				// Ignore disconnect errors
			}
			this.polymesh = null;
		}
	}
	
	/**
	 * Subscribe to block events
	 */
	async subscribeToBlocks(
		handler: SubscriptionHandler,
	): Promise<string> {
		await this.connect();
		
		const subscriptionId = this.generateSubscriptionId();
		
		// Subscribe to new blocks using the Polkadot API
		const api = (this.polymesh as any)._polkadotApi;
		
		const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header: any) => {
			const blockNumber = header.number.toNumber();
			const blockHash = header.hash.toHex();
			
			const event: PolymeshEvent = {
				type: PolymeshEventType.NewBlock,
				blockNumber,
				blockHash,
				timestamp: new Date(),
				data: {
					parentHash: header.parentHash.toHex(),
					stateRoot: header.stateRoot.toHex(),
					extrinsicsRoot: header.extrinsicsRoot.toHex(),
				},
				raw: header.toHuman(),
			};
			
			await handler(event);
		});
		
		this.subscriptions.set(subscriptionId, {
			id: subscriptionId,
			eventType: PolymeshEventType.NewBlock,
			handler,
			unsubscribe: () => unsubscribe(),
		});
		
		return subscriptionId;
	}
	
	/**
	 * Subscribe to specific events
	 */
	async subscribeToEvents(
		eventTypes: PolymeshEventType[],
		handler: SubscriptionHandler,
		filter?: Record<string, unknown>,
	): Promise<string> {
		await this.connect();
		
		const subscriptionId = this.generateSubscriptionId();
		
		// Get the Polkadot API
		const api = (this.polymesh as any)._polkadotApi;
		
		// Subscribe to system events
		const unsubscribe = await api.query.system.events((events: any) => {
			events.forEach((record: any) => {
				const { event, phase } = record;
				const eventKey = `${event.section}.${event.method}` as PolymeshEventType;
				
				// Check if this event type is in our subscription list
				if (eventTypes.includes(eventKey)) {
					// Apply filter if provided
					if (filter && !this.matchesFilter(event.data.toHuman(), filter)) {
						return;
					}
					
					const polymeshEvent: PolymeshEvent = {
						type: eventKey,
						blockNumber: 0, // Will be populated by block subscription
						blockHash: '',
						timestamp: new Date(),
						data: event.data.toHuman() as Record<string, unknown>,
						raw: record.toHuman(),
					};
					
					handler(polymeshEvent);
				}
			});
		});
		
		this.subscriptions.set(subscriptionId, {
			id: subscriptionId,
			eventType: eventTypes[0],
			filter,
			handler,
			unsubscribe: () => unsubscribe(),
		});
		
		return subscriptionId;
	}
	
	/**
	 * Subscribe to balance changes
	 */
	async subscribeToBalanceChanges(
		address: string,
		handler: SubscriptionHandler,
	): Promise<string> {
		await this.connect();
		
		const subscriptionId = this.generateSubscriptionId();
		const api = (this.polymesh as any)._polkadotApi;
		
		const unsubscribe = await api.query.system.account(address, (accountInfo: any) => {
			const event: PolymeshEvent = {
				type: PolymeshEventType.BalanceChanged,
				blockNumber: 0,
				blockHash: '',
				timestamp: new Date(),
				data: {
					address,
					free: accountInfo.data.free.toString(),
					reserved: accountInfo.data.reserved.toString(),
					frozen: accountInfo.data.frozen?.toString() || '0',
				},
				raw: accountInfo.toHuman(),
			};
			
			handler(event);
		});
		
		this.subscriptions.set(subscriptionId, {
			id: subscriptionId,
			eventType: PolymeshEventType.BalanceChanged,
			filter: { address },
			handler,
			unsubscribe: () => unsubscribe(),
		});
		
		return subscriptionId;
	}
	
	/**
	 * Unsubscribe from a specific subscription
	 */
	unsubscribe(subscriptionId: string): boolean {
		const subscription = this.subscriptions.get(subscriptionId);
		if (subscription) {
			try {
				subscription.unsubscribe();
			} catch {
				// Ignore
			}
			this.subscriptions.delete(subscriptionId);
			return true;
		}
		return false;
	}
	
	/**
	 * Get all active subscriptions
	 */
	getActiveSubscriptions(): ActiveSubscription[] {
		return Array.from(this.subscriptions.values());
	}
	
	/**
	 * Generate a unique subscription ID
	 */
	private generateSubscriptionId(): string {
		return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
	
	/**
	 * Check if event data matches a filter
	 */
	private matchesFilter(
		data: unknown,
		filter: Record<string, unknown>,
	): boolean {
		if (!data || typeof data !== 'object') {
			return false;
		}
		
		const dataObj = data as Record<string, unknown>;
		
		for (const [key, value] of Object.entries(filter)) {
			if (dataObj[key] !== value) {
				return false;
			}
		}
		
		return true;
	}
}

/**
 * Create a subscription client
 */
export function createSubscriptionClient(
	options: PolymeshConnectionOptions,
): PolymeshSubscriptionClient {
	return new PolymeshSubscriptionClient(options);
}

/**
 * Event type options for n8n UI
 */
export const EVENT_TYPE_OPTIONS = [
	// Identity events
	{ name: 'Identity Created', value: PolymeshEventType.IdentityCreated },
	{ name: 'CDD Claim Added', value: PolymeshEventType.CddClaimAdded },
	{ name: 'CDD Claim Revoked', value: PolymeshEventType.CddClaimRevoked },
	{ name: 'Secondary Key Added', value: PolymeshEventType.SecondaryKeyAdded },
	{ name: 'Secondary Key Removed', value: PolymeshEventType.SecondaryKeyRemoved },
	{ name: 'Authorization Added', value: PolymeshEventType.AuthorizationAdded },
	
	// Asset events
	{ name: 'Asset Created', value: PolymeshEventType.AssetCreated },
	{ name: 'Tokens Issued', value: PolymeshEventType.TokensIssued },
	{ name: 'Tokens Redeemed', value: PolymeshEventType.TokensRedeemed },
	{ name: 'Asset Frozen', value: PolymeshEventType.AssetFrozen },
	{ name: 'Asset Unfrozen', value: PolymeshEventType.AssetUnfrozen },
	
	// Settlement events
	{ name: 'Venue Created', value: PolymeshEventType.VenueCreated },
	{ name: 'Instruction Created', value: PolymeshEventType.InstructionCreated },
	{ name: 'Instruction Affirmed', value: PolymeshEventType.InstructionAffirmed },
	{ name: 'Instruction Executed', value: PolymeshEventType.InstructionExecuted },
	{ name: 'Instruction Failed', value: PolymeshEventType.InstructionFailed },
	
	// Portfolio events
	{ name: 'Portfolio Created', value: PolymeshEventType.PortfolioCreated },
	{ name: 'Assets Moved', value: PolymeshEventType.AssetsMoved },
	{ name: 'Custody Transferred', value: PolymeshEventType.CustodyTransferred },
	
	// Corporate action events
	{ name: 'Dividend Announced', value: PolymeshEventType.DividendAnnounced },
	{ name: 'Dividend Paid', value: PolymeshEventType.DividendPaid },
	{ name: 'Ballot Created', value: PolymeshEventType.BallotCreated },
	{ name: 'Vote Cast', value: PolymeshEventType.VoteCast },
	{ name: 'Checkpoint Created', value: PolymeshEventType.CheckpointCreated },
	
	// Account events
	{ name: 'POLYX Transfer', value: PolymeshEventType.PolyxTransfer },
	{ name: 'Balance Changed', value: PolymeshEventType.BalanceChanged },
	
	// Governance events
	{ name: 'PIP Proposed', value: PolymeshEventType.PipProposed },
	{ name: 'PIP Voted', value: PolymeshEventType.PipVoted },
	{ name: 'PIP Executed', value: PolymeshEventType.PipExecuted },
	
	// Block events
	{ name: 'New Block', value: PolymeshEventType.NewBlock },
];
