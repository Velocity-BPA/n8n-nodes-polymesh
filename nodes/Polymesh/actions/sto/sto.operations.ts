import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';

export async function getStoDetails(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const stoId = this.getNodeParameter('stoId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const offering = await asset.offerings.getOne({ id: BigInt(stoId) });
	
	const details = await offering.details();
	
	return [{ json: {
		id: offering.id.toString(),
		ticker,
		name: details.name,
		status: details.status,
		start: details.start,
		end: details.end,
		raisingCurrency: details.raisingCurrency,
		raisingPortfolio: details.raisingPortfolio?.toHuman(),
		offeringPortfolio: details.offeringPortfolio?.toHuman(),
		tiers: details.tiers?.map(t => ({
			price: t.price.toString(),
			amount: t.amount.toString(),
			remaining: t.remaining.toString(),
		})),
		minInvestment: details.minInvestment?.toString(),
		totalAmount: details.totalAmount?.toString(),
		totalRemaining: details.totalRemaining?.toString(),
	} }];
}

export async function createFundraiser(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const raisingCurrency = this.getNodeParameter('raisingCurrency', index) as string;
	const offeringPortfolioId = this.getNodeParameter('offeringPortfolioId', index) as string;
	const raisingPortfolioId = this.getNodeParameter('raisingPortfolioId', index) as string;
	const tiers = this.getNodeParameter('tiers', index) as { tierValues: Array<{ price: string; amount: string }> };
	const start = this.getNodeParameter('start', index) as string;
	const end = this.getNodeParameter('end', index) as string;
	const minInvestment = this.getNodeParameter('minInvestment', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(this.getNode(), 'No signing identity available');
	}
	
	const offeringPortfolio = offeringPortfolioId === '0'
		? await identity.portfolios.getPortfolio()
		: await identity.portfolios.getPortfolio({ portfolioId: BigInt(offeringPortfolioId) });
	
	const raisingPortfolio = raisingPortfolioId === '0'
		? await identity.portfolios.getPortfolio()
		: await identity.portfolios.getPortfolio({ portfolioId: BigInt(raisingPortfolioId) });
	
	try {
		const tx = await asset.offerings.launch({
			name,
			offeringPortfolio,
			raisingPortfolio,
			raisingCurrency,
			tiers: tiers.tierValues.map(t => ({
				price: BigInt(t.price),
				amount: BigInt(t.amount),
			})),
			start: start ? new Date(start) : undefined,
			end: end ? new Date(end) : undefined,
			minInvestment: minInvestment ? BigInt(minInvestment) : undefined,
		});
		
		const offering = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			stoId: offering?.id?.toString(),
			name,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function modifyFundraiserTimes(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const stoId = this.getNodeParameter('stoId', index) as string;
	const start = this.getNodeParameter('start', index) as string;
	const end = this.getNodeParameter('end', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const offering = await asset.offerings.getOne({ id: BigInt(stoId) });
	
	try {
		const tx = await offering.modifyTimes({
			start: start ? new Date(start) : undefined,
			end: end ? new Date(end) : undefined,
		});
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			stoId,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function freezeFundraiser(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const stoId = this.getNodeParameter('stoId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const offering = await asset.offerings.getOne({ id: BigInt(stoId) });
	
	try {
		const tx = await offering.freeze();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			stoId,
			frozen: true,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function unfreezeFundraiser(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const stoId = this.getNodeParameter('stoId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const offering = await asset.offerings.getOne({ id: BigInt(stoId) });
	
	try {
		const tx = await offering.unfreeze();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			stoId,
			frozen: false,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function closeFundraiser(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const stoId = this.getNodeParameter('stoId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const offering = await asset.offerings.getOne({ id: BigInt(stoId) });
	
	try {
		const tx = await offering.close();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			stoId,
			closed: true,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function investInFundraiser(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const stoId = this.getNodeParameter('stoId', index) as string;
	const purchaseAmount = this.getNodeParameter('purchaseAmount', index) as string;
	const maxPrice = this.getNodeParameter('maxPrice', index) as string;
	const fundingPortfolioId = this.getNodeParameter('fundingPortfolioId', index) as string;
	const purchasePortfolioId = this.getNodeParameter('purchasePortfolioId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const offering = await asset.offerings.getOne({ id: BigInt(stoId) });
	const identity = await polymesh.getSigningIdentity();
	
	if (!identity) {
		throw new NodeOperationError(this.getNode(), 'No signing identity available');
	}
	
	const fundingPortfolio = fundingPortfolioId === '0'
		? await identity.portfolios.getPortfolio()
		: await identity.portfolios.getPortfolio({ portfolioId: BigInt(fundingPortfolioId) });
	
	const purchasePortfolio = purchasePortfolioId === '0'
		? await identity.portfolios.getPortfolio()
		: await identity.portfolios.getPortfolio({ portfolioId: BigInt(purchasePortfolioId) });
	
	try {
		const tx = await offering.invest({
			purchaseAmount: BigInt(purchaseAmount),
			maxPrice: maxPrice ? BigInt(maxPrice) : undefined,
			fundingPortfolio,
			purchasePortfolio,
		});
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			stoId,
			purchaseAmount,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getInvestments(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const stoId = this.getNodeParameter('stoId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const offering = await asset.offerings.getOne({ id: BigInt(stoId) });
	
	const investments = await offering.getInvestments();
	
	return [{ json: {
		ticker,
		stoId,
		investments: investments.data.map(inv => ({
			investor: inv.investor.did,
			soldAmount: inv.soldAmount.toString(),
			investedAmount: inv.investedAmount.toString(),
		})),
	} }];
}

export async function getAllOfferings(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const offerings = await asset.offerings.get();
	
	const results = await Promise.all(offerings.map(async (o) => {
		const details = await o.details();
		return {
			id: o.id.toString(),
			name: details.name,
			status: details.status,
			start: details.start,
			end: details.end,
		};
	}));
	
	return [{ json: { ticker, offerings: results } }];
}

// Main operation executor
export async function executeStoOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getStoDetails':
			return getStoDetails.call(this, index);
		case 'createFundraiser':
			return createFundraiser.call(this, index);
		case 'modifyFundraiserTimes':
			return modifyFundraiserTimes.call(this, index);
		case 'freezeFundraiser':
			return freezeFundraiser.call(this, index);
		case 'unfreezeFundraiser':
			return unfreezeFundraiser.call(this, index);
		case 'closeFundraiser':
			return closeFundraiser.call(this, index);
		case 'investInFundraiser':
			return investInFundraiser.call(this, index);
		case 'getInvestments':
			return getInvestments.call(this, index);
		case 'getAllOfferings':
			return getAllOfferings.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown STO operation: ${operation}`);
	}
}
