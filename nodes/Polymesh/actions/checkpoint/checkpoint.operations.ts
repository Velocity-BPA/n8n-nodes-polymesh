import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';

export async function getCheckpointsForAsset(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const checkpoints = await asset.checkpoints.get();
	
	const results = await Promise.all(checkpoints.data.map(async (cp) => ({
		id: cp.id.toString(),
		createdAt: cp.createdAt,
		totalSupply: (await cp.totalSupply()).toString(),
	})));
	
	return [{ json: { ticker, checkpoints: results } }];
}

export async function getCheckpointDetails(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const checkpointId = this.getNodeParameter('checkpointId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const checkpoint = await asset.checkpoints.getOne({ id: BigInt(checkpointId) });
	
	const totalSupply = await checkpoint.totalSupply();
	const allBalances = await checkpoint.allBalances();
	
	return [{ json: {
		id: checkpoint.id.toString(),
		ticker,
		createdAt: checkpoint.createdAt,
		totalSupply: totalSupply.toString(),
		balances: allBalances.data.map(b => ({
			identity: b.identity.did,
			balance: b.balance.toString(),
		})),
	} }];
}

export async function getCheckpointBalanceFor(
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

export async function createAssetCheckpoint(
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

export async function getCheckpointSchedules(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const schedules = await asset.checkpoints.schedules.get();
	
	return [{ json: {
		ticker,
		schedules: schedules.map(s => ({
			id: s.id.toString(),
			period: s.period,
			start: s.start,
			remaining: s.remaining?.toString(),
			nextCheckpointDate: s.nextCheckpointDate,
		})),
	} }];
}

export async function createSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const start = this.getNodeParameter('start', index) as string;
	const periodUnit = this.getNodeParameter('periodUnit', index) as string;
	const periodAmount = this.getNodeParameter('periodAmount', index) as number;
	const repetitions = this.getNodeParameter('repetitions', index) as number;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	try {
		const tx = await asset.checkpoints.schedules.create({
			start: new Date(start),
			period: { unit: periodUnit as any, amount: periodAmount },
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

export async function removeSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const schedule = await asset.checkpoints.schedules.getOne({ id: BigInt(scheduleId) });
	
	try {
		const tx = await schedule.remove();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			scheduleId,
			removed: true,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getTotalSupplyAtCheckpoint(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const checkpointId = this.getNodeParameter('checkpointId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const checkpoint = await asset.checkpoints.getOne({ id: BigInt(checkpointId) });
	
	const totalSupply = await checkpoint.totalSupply();
	
	return [{ json: {
		ticker,
		checkpointId,
		totalSupply: totalSupply.toString(),
	} }];
}

export async function getHoldersAtCheckpoint(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const checkpointId = this.getNodeParameter('checkpointId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const checkpoint = await asset.checkpoints.getOne({ id: BigInt(checkpointId) });
	
	const allBalances = await checkpoint.allBalances();
	
	return [{ json: {
		ticker,
		checkpointId,
		holderCount: allBalances.data.length,
		holders: allBalances.data.map(b => ({
			identity: b.identity.did,
			balance: b.balance.toString(),
		})),
	} }];
}

/**
 * Execute checkpoint operation
 */
export async function executeCheckpointOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getCheckpointsForAsset':
			return getCheckpointsForAsset.call(this, index);
		case 'getCheckpointDetails':
			return getCheckpointDetails.call(this, index);
		case 'getCheckpointBalanceFor':
			return getCheckpointBalanceFor.call(this, index);
		case 'createAssetCheckpoint':
			return createAssetCheckpoint.call(this, index);
		case 'getCheckpointSchedules':
			return getCheckpointSchedules.call(this, index);
		case 'createSchedule':
			return createSchedule.call(this, index);
		case 'removeSchedule':
			return removeSchedule.call(this, index);
		case 'getTotalSupplyAtCheckpoint':
			return getTotalSupplyAtCheckpoint.call(this, index);
		case 'getHoldersAtCheckpoint':
			return getHoldersAtCheckpoint.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown checkpoint operation: ${operation}`,
			);
	}
}
