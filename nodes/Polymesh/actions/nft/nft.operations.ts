import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction, getSigningIdentity } from '../../transport/polymeshClient';

export async function getNftCollection(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const nftCollection = await polymesh.assets.getNftCollection({ ticker });
	
	const details = await nftCollection.details();
	const collectionKeys = await nftCollection.collectionKeys();
	
	return [{ json: {
		ticker,
		name: details.name,
		assetType: details.assetType,
		isDivisible: details.isDivisible,
		owner: details.owner?.did,
		totalSupply: details.totalSupply?.toString(),
		collectionKeys: collectionKeys.map(k => ({
			type: k.type,
			id: k.id?.toString(),
			name: k.name,
		})),
	} }];
}

export async function createNftCollection(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const nftType = this.getNodeParameter('nftType', index) as string;
	const collectionKeys = this.getNodeParameter('collectionKeys', index) as { keyValues: Array<{ type: string; name: string }> };
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const tx = await polymesh.assets.createNftCollection({
			ticker,
			name,
			nftType: nftType as any,
			collectionKeys: collectionKeys.keyValues.map(k => ({
				type: k.type as any,
				name: k.name,
			})),
		});
		
		const collection = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			name,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function issueNft(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const metadata = this.getNodeParameter('metadata', index) as { metadataValues: Array<{ key: string; value: string }> };
	const portfolioId = this.getNodeParameter('portfolioId', index, '0') as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const nftCollection = await polymesh.assets.getNftCollection({ ticker });
	const identity = await getSigningIdentity.call(this);
	
	const portfolio = portfolioId === '0'
		? await identity.portfolios.getPortfolio()
		: await identity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });
	
	try {
		const tx = await nftCollection.issue({
			metadata: metadata.metadataValues.map(m => ({
				key: m.key as any,
				value: m.value,
			})),
			portfolio,
		});
		
		const nft = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			nftId: nft?.id?.toString(),
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getNftDetails(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const nftId = this.getNodeParameter('nftId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const nftCollection = await polymesh.assets.getNftCollection({ ticker });
	const nft = await nftCollection.getNft({ id: BigInt(nftId) });
	
	const metadata = await nft.getMetadata();
	const owner = await nft.getOwner();
	
	return [{ json: {
		ticker,
		id: nft.id.toString(),
		owner: owner?.owner?.did,
		portfolio: owner?.portfolio?.toHuman?.(),
		metadata: metadata.map(m => ({
			key: m.key,
			value: m.value,
		})),
	} }];
}

export async function redeemNft(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const nftId = this.getNodeParameter('nftId', index) as string;
	const portfolioId = this.getNodeParameter('portfolioId', index, '0') as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const nftCollection = await polymesh.assets.getNftCollection({ ticker });
	const nft = await nftCollection.getNft({ id: BigInt(nftId) });
	const identity = await getSigningIdentity.call(this);
	
	const portfolio = portfolioId === '0'
		? await identity.portfolios.getPortfolio()
		: await identity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });
	
	try {
		const tx = await nft.redeem({ from: portfolio });
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			nftId,
			redeemed: true,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getNftsByOwner(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const did = this.getNodeParameter('did', index, '') as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const nftCollection = await polymesh.assets.getNftCollection({ ticker });
	
	let identity;
	if (did) {
		identity = await polymesh.identities.getIdentity({ did });
	} else {
		identity = await getSigningIdentity.call(this);
	}
	
	const portfolios = await identity.portfolios.getPortfolios();
	const allNfts: any[] = [];
	
	for (const portfolio of portfolios) {
		const nfts = await portfolio.getCollections();
		const collection = nfts.find(c => c.collection.ticker === ticker);
		if (collection) {
			allNfts.push(...collection.nfts.map(n => ({
				id: n.id.toString(),
				portfolio: portfolio.toHuman?.(),
			})));
		}
	}
	
	return [{ json: {
		ticker,
		owner: identity.did,
		nfts: allNfts,
	} }];
}

export async function getNftMetadata(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const nftId = this.getNodeParameter('nftId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const nftCollection = await polymesh.assets.getNftCollection({ ticker });
	const nft = await nftCollection.getNft({ id: BigInt(nftId) });
	
	const metadata = await nft.getMetadata();
	
	return [{ json: {
		ticker,
		nftId,
		metadata: metadata.map(m => ({
			key: m.key,
			value: m.value,
		})),
	} }];
}

export async function getCollectionAsset(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const nftCollection = await polymesh.assets.getNftCollection({ ticker });
	
	// NFT collections are also assets
	const asset = nftCollection as any;
	const details = await asset.details();
	
	return [{ json: {
		ticker,
		name: details.name,
		assetType: details.assetType,
		owner: details.owner?.did,
		totalSupply: details.totalSupply?.toString(),
	} }];
}

/**
 * Execute NFT operation
 */
export async function executeNftOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getNftCollection':
			return getNftCollection.call(this, index);
		case 'createNftCollection':
			return createNftCollection.call(this, index);
		case 'issueNft':
			return issueNft.call(this, index);
		case 'getNftDetails':
			return getNftDetails.call(this, index);
		case 'redeemNft':
			return redeemNft.call(this, index);
		case 'getNftsByOwner':
			return getNftsByOwner.call(this, index);
		case 'getNftMetadata':
			return getNftMetadata.call(this, index);
		case 'getCollectionAsset':
			return getCollectionAsset.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown NFT operation: ${operation}`,
			);
	}
}
