import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';

export async function getCorporateActions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const corporateActions = await asset.corporateActions.get();
	
	return [{ json: { ticker, corporateActions: corporateActions.map(ca => ({
		id: ca.id.toString(),
		kind: ca.kind,
		declarationDate: ca.declarationDate,
		description: ca.description,
		targets: ca.targets,
		defaultTaxWithholding: ca.defaultTaxWithholding?.toString(),
		taxWithholdings: ca.taxWithholdings,
	})) } }];
}

export async function getDividendDistribution(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const distributionId = this.getNodeParameter('distributionId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const distribution = await asset.corporateActions.distributions.getOne({ id: BigInt(distributionId) });
	
	const details = await distribution.details();
	const participants = await distribution.getParticipants();
	
	return [{ json: {
		id: distribution.id.toString(),
		ticker,
		details: {
			origin: details.origin?.toHuman(),
			currency: details.currency,
			perShare: details.perShare.toString(),
			maxAmount: details.maxAmount.toString(),
			expiryDate: details.expiryDate,
			paymentDate: details.paymentDate,
		},
		participants: participants.map(p => ({
			identity: p.identity.did,
			amount: p.amount.toString(),
			paid: p.paid,
		})),
	} }];
}

export async function createDividendDistribution(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const checkpointId = this.getNodeParameter('checkpointId', index) as string;
	const originPortfolioId = this.getNodeParameter('originPortfolioId', index) as string;
	const currency = this.getNodeParameter('currency', index) as string;
	const perShare = this.getNodeParameter('perShare', index) as string;
	const maxAmount = this.getNodeParameter('maxAmount', index) as string;
	const paymentDate = this.getNodeParameter('paymentDate', index) as string;
	const expiryDate = this.getNodeParameter('expiryDate', index) as string;
	const description = this.getNodeParameter('description', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(this.getNode(), 'No signing identity available');
	}
	
	const checkpoint = await asset.checkpoints.getOne({ id: BigInt(checkpointId) });
	const originPortfolio = originPortfolioId === '0' 
		? await identity.portfolios.getPortfolio()
		: await identity.portfolios.getPortfolio({ portfolioId: BigInt(originPortfolioId) });
	
	try {
		const tx = await asset.corporateActions.distributions.configureDividendDistribution({
			checkpoint,
			originPortfolio,
			currency,
			perShare: BigInt(perShare),
			maxAmount: BigInt(maxAmount),
			paymentDate: new Date(paymentDate),
			expiryDate: expiryDate ? new Date(expiryDate) : undefined,
			description,
		});
		
		const result = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			distributionId: result?.id?.toString(),
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function claimDividend(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const distributionId = this.getNodeParameter('distributionId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const distribution = await asset.corporateActions.distributions.getOne({ id: BigInt(distributionId) });
	
	try {
		const tx = await distribution.claim();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			distributionId,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function pushDividendPayment(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const distributionId = this.getNodeParameter('distributionId', index) as string;
	const targets = this.getNodeParameter('targets', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const distribution = await asset.corporateActions.distributions.getOne({ id: BigInt(distributionId) });
	
	const targetDids = targets.split(',').map(t => t.trim());
	
	try {
		const tx = await distribution.pay({ targets: targetDids });
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			distributionId,
			targets: targetDids,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function reclaimDividend(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const distributionId = this.getNodeParameter('distributionId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const distribution = await asset.corporateActions.distributions.getOne({ id: BigInt(distributionId) });
	
	try {
		const tx = await distribution.reclaimFunds();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			distributionId,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getCheckpoints(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const checkpoints = await asset.checkpoints.get();
	
	return [{ json: { ticker, checkpoints: checkpoints.data.map(cp => ({
		id: cp.id.toString(),
		createdAt: cp.createdAt,
	})) } }];
}

export async function createCheckpoint(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	try {
		const tx = await asset.checkpoints.create();
		const checkpoint = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			checkpointId: checkpoint?.id?.toString(),
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function createCheckpointSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const start = this.getNodeParameter('start', index) as string;
	const period = this.getNodeParameter('period', index) as string;
	const repetitions = this.getNodeParameter('repetitions', index) as number;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	const periodMap: Record<string, any> = {
		daily: { unit: 'Days', amount: 1 },
		weekly: { unit: 'Weeks', amount: 1 },
		monthly: { unit: 'Months', amount: 1 },
		quarterly: { unit: 'Months', amount: 3 },
		yearly: { unit: 'Years', amount: 1 },
	};
	
	try {
		const tx = await asset.checkpoints.schedules.create({
			start: new Date(start),
			period: periodMap[period],
			repetitions: repetitions > 0 ? repetitions : undefined,
		});
		
		const schedule = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			scheduleId: schedule?.id?.toString(),
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getCheckpointBalance(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const checkpointId = this.getNodeParameter('checkpointId', index) as string;
	const did = this.getNodeParameter('did', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const checkpoint = await asset.checkpoints.getOne({ id: BigInt(checkpointId) });
	
	const identity = await polymesh.identities.getIdentity({ did });
	const balance = await checkpoint.balance({ identity });
	
	return [{ json: {
		ticker,
		checkpointId,
		did,
		balance: balance.toString(),
	} }];
}

export async function getDistributionTargets(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const distributionId = this.getNodeParameter('distributionId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const distribution = await asset.corporateActions.distributions.getOne({ id: BigInt(distributionId) });
	
	const participants = await distribution.getParticipants();
	
	return [{ json: {
		ticker,
		distributionId,
		targets: participants.map(p => ({
			identity: p.identity.did,
			amount: p.amount.toString(),
			paid: p.paid,
		})),
	} }];
}

/**
 * Execute corporate actions operation
 */
export async function executeCorporateActionsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getCorporateActions':
			return getCorporateActions.call(this, index);
		case 'getDividendDistribution':
			return getDividendDistribution.call(this, index);
		case 'createDividendDistribution':
			return createDividendDistribution.call(this, index);
		case 'claimDividend':
			return claimDividend.call(this, index);
		case 'pushDividendPayment':
			return pushDividendPayment.call(this, index);
		case 'reclaimDividend':
			return reclaimDividend.call(this, index);
		case 'getCheckpoints':
			return getCheckpoints.call(this, index);
		case 'createCheckpoint':
			return createCheckpoint.call(this, index);
		case 'createCheckpointSchedule':
			return createCheckpointSchedule.call(this, index);
		case 'getCheckpointBalance':
			return getCheckpointBalance.call(this, index);
		case 'getDistributionTargets':
			return getDistributionTargets.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown corporate actions operation: ${operation}`,
			);
	}
}
