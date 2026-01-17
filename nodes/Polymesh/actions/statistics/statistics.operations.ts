import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';

export async function getAssetStatistics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	const activeStats = await asset.transferRestrictions.count.get();
	const investorCount = await asset.investorCount();
	
	return [{ json: {
		ticker,
		investorCount: investorCount.toString(),
		activeStatistics: activeStats,
	} }];
}

export async function getTransferRestrictions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const restrictionType = this.getNodeParameter('restrictionType', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	let restrictions: any;
	switch (restrictionType) {
		case 'count':
			restrictions = await asset.transferRestrictions.count.get();
			break;
		case 'percentage':
			restrictions = await asset.transferRestrictions.percentage.get();
			break;
		case 'claimCount':
			restrictions = await asset.transferRestrictions.claimCount.get();
			break;
		case 'claimPercentage':
			restrictions = await asset.transferRestrictions.claimPercentage.get();
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Unknown restriction type: ${restrictionType}`);
	}
	
	return [{ json: { ticker, restrictionType, restrictions } }];
}

export async function setCountRestriction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const count = this.getNodeParameter('count', index) as number;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	try {
		const tx = await asset.transferRestrictions.count.set({
			restrictions: [{ count: BigInt(count) }],
		});
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			restrictionType: 'count',
			count,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function setPercentageRestriction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const percentage = this.getNodeParameter('percentage', index) as number;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	try {
		const tx = await asset.transferRestrictions.percentage.set({
			restrictions: [{ percentage: BigInt(percentage * 10000) }], // basis points
		});
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			restrictionType: 'percentage',
			percentage,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function removeTransferRestrictions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const restrictionType = this.getNodeParameter('restrictionType', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	try {
		let tx: any;
		switch (restrictionType) {
			case 'count':
				tx = await asset.transferRestrictions.count.set({ restrictions: [] });
				break;
			case 'percentage':
				tx = await asset.transferRestrictions.percentage.set({ restrictions: [] });
				break;
			case 'claimCount':
				tx = await asset.transferRestrictions.claimCount.set({ restrictions: [] });
				break;
			case 'claimPercentage':
				tx = await asset.transferRestrictions.claimPercentage.set({ restrictions: [] });
				break;
			default:
				throw new NodeOperationError(this.getNode(), `Unknown restriction type: ${restrictionType}`);
		}
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			restrictionType,
			removed: true,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getExemptedEntities(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const restrictionType = this.getNodeParameter('restrictionType', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	let exemptions: any;
	switch (restrictionType) {
		case 'count':
			exemptions = await asset.transferRestrictions.count.getExemptions();
			break;
		case 'percentage':
			exemptions = await asset.transferRestrictions.percentage.getExemptions();
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Exemptions not available for: ${restrictionType}`);
	}
	
	return [{ json: {
		ticker,
		restrictionType,
		exemptions: exemptions?.map((e: any) => e.did) || [],
	} }];
}

export async function addExemptedEntity(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const restrictionType = this.getNodeParameter('restrictionType', index) as string;
	const did = this.getNodeParameter('did', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const identity = await polymesh.identities.getIdentity({ did });
	
	try {
		let tx: any;
		switch (restrictionType) {
			case 'count':
				tx = await asset.transferRestrictions.count.addExemption({ exemption: { identity } });
				break;
			case 'percentage':
				tx = await asset.transferRestrictions.percentage.addExemption({ exemption: { identity } });
				break;
			default:
				throw new NodeOperationError(this.getNode(), `Exemptions not available for: ${restrictionType}`);
		}
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			restrictionType,
			exemptedDid: did,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getInvestorCount(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const count = await asset.investorCount();
	
	return [{ json: { ticker, investorCount: count.toString() } }];
}

export async function getBalanceStatistics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	const holders = await asset.assetHolders.get();
	const totalSupply = await asset.details();
	
	const balances = holders.data.map(h => BigInt(h.balance.toString()));
	const total = balances.reduce((a, b) => a + b, BigInt(0));
	const average = balances.length > 0 ? total / BigInt(balances.length) : BigInt(0);
	
	return [{ json: {
		ticker,
		holderCount: holders.data.length,
		totalSupply: totalSupply.totalSupply.toString(),
		averageBalance: average.toString(),
	} }];
}

/**
 * Execute statistics operation
 */
export async function executeStatisticsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getAssetStatistics':
			return getAssetStatistics.call(this, index);
		case 'getTransferRestrictions':
			return getTransferRestrictions.call(this, index);
		case 'setCountRestriction':
			return setCountRestriction.call(this, index);
		case 'setPercentageRestriction':
			return setPercentageRestriction.call(this, index);
		case 'removeTransferRestrictions':
			return removeTransferRestrictions.call(this, index);
		case 'getExemptedEntities':
			return getExemptedEntities.call(this, index);
		case 'addExemptedEntity':
			return addExemptedEntity.call(this, index);
		case 'getInvestorCount':
			return getInvestorCount.call(this, index);
		case 'getBalanceStatistics':
			return getBalanceStatistics.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown statistics operation: ${operation}`,
			);
	}
}
