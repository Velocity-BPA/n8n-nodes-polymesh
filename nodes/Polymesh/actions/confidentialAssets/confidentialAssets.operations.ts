import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction, getSigningIdentity } from '../../transport/polymeshClient';

export async function getConfidentialAsset(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const assetId = this.getNodeParameter('assetId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	// Note: Confidential assets API may require specific SDK version
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			return [{ json: { 
				assetId, 
				error: 'Confidential assets feature not available in current SDK version' 
			} }];
		}
		
		const asset = await confidentialAssets.getConfidentialAsset({ id: assetId });
		const details = await asset.details();
		
		return [{ json: {
			id: asset.id,
			ticker: details.ticker,
			owner: details.owner?.did,
			totalSupply: details.totalSupply?.toString(),
			auditors: details.auditors?.map((a: any) => a.did) || [],
			mediators: details.mediators?.map((m: any) => m.did) || [],
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function createConfidentialAsset(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const auditors = this.getNodeParameter('auditors', index) as string;
	const mediators = this.getNodeParameter('mediators', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			throw new NodeOperationError(this.getNode(), 'Confidential assets feature not available');
		}
		
		const auditorDids = auditors ? auditors.split(',').map(a => a.trim()) : [];
		const mediatorDids = mediators ? mediators.split(',').map(m => m.trim()) : [];
		
		const tx = await confidentialAssets.createConfidentialAsset({
			ticker,
			auditors: auditorDids,
			mediators: mediatorDids,
		});
		
		const asset = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			assetId: asset?.id,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getConfidentialAccount(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const accountId = this.getNodeParameter('accountId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			return [{ json: { 
				accountId, 
				error: 'Confidential assets feature not available' 
			} }];
		}
		
		const account = await confidentialAssets.getConfidentialAccount({ id: accountId });
		const identity = await account.getIdentity();
		
		return [{ json: {
			id: account.id,
			publicKey: account.publicKey,
			identity: identity?.did,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function createConfidentialAccount(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			throw new NodeOperationError(this.getNode(), 'Confidential assets feature not available');
		}
		
		const tx = await confidentialAssets.createConfidentialAccount();
		const account = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			accountId: account?.id,
			publicKey: account?.publicKey,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getConfidentialBalance(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const accountId = this.getNodeParameter('accountId', index) as string;
	const assetId = this.getNodeParameter('assetId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			return [{ json: { 
				accountId, 
				assetId, 
				error: 'Confidential assets feature not available' 
			} }];
		}
		
		const account = await confidentialAssets.getConfidentialAccount({ id: accountId });
		const asset = await confidentialAssets.getConfidentialAsset({ id: assetId });
		
		const balance = await account.getBalance({ asset });
		
		return [{ json: {
			accountId,
			assetId,
			encryptedBalance: balance?.toString(),
			note: 'Balance is encrypted; decryption requires private key',
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getConfidentialTransaction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const transactionId = this.getNodeParameter('transactionId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			return [{ json: { 
				transactionId, 
				error: 'Confidential assets feature not available' 
			} }];
		}
		
		const transaction = await confidentialAssets.getConfidentialTransaction({ id: transactionId });
		const details = await transaction.details();
		
		return [{ json: {
			id: transaction.id,
			status: details.status,
			legs: details.legs?.map((l: any) => ({
				sender: l.sender?.id,
				receiver: l.receiver?.id,
				asset: l.asset?.id,
			})),
			createdAt: details.createdAt,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function createConfidentialTransaction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const venueId = this.getNodeParameter('venueId', index) as string;
	const legs = this.getNodeParameter('legs', index) as { legValues: Array<{ senderAccount: string; receiverAccount: string; assetId: string; amount: string }> };
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			throw new NodeOperationError(this.getNode(), 'Confidential assets feature not available');
		}
		
		const venue = await polymesh.settlements.getVenue({ id: BigInt(venueId) });
		
		const tx = await venue.addConfidentialTransaction({
			legs: legs.legValues.map(l => ({
				sender: l.senderAccount,
				receiver: l.receiverAccount,
				assets: [{ asset: l.assetId, amount: BigInt(l.amount) }],
			})),
		});
		
		const transaction = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			transactionId: transaction?.id?.toString(),
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function affirmConfidentialTransaction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const transactionId = this.getNodeParameter('transactionId', index) as string;
	const legId = this.getNodeParameter('legId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			throw new NodeOperationError(this.getNode(), 'Confidential assets feature not available');
		}
		
		const transaction = await confidentialAssets.getConfidentialTransaction({ id: transactionId });
		
		const tx = await transaction.affirmLeg({
			legId: BigInt(legId),
		});
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			transactionId,
			legId,
			affirmed: true,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getAuditors(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const assetId = this.getNodeParameter('assetId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			return [{ json: { 
				assetId, 
				error: 'Confidential assets feature not available' 
			} }];
		}
		
		const asset = await confidentialAssets.getConfidentialAsset({ id: assetId });
		const details = await asset.details();
		
		return [{ json: {
			assetId,
			auditors: details.auditors?.map((a: any) => ({
				did: a.did,
				publicKey: a.publicKey,
			})) || [],
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getMediators(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const assetId = this.getNodeParameter('assetId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	try {
		const confidentialAssets = (polymesh as any).confidentialAssets;
		if (!confidentialAssets) {
			return [{ json: { 
				assetId, 
				error: 'Confidential assets feature not available' 
			} }];
		}
		
		const asset = await confidentialAssets.getConfidentialAsset({ id: assetId });
		const details = await asset.details();
		
		return [{ json: {
			assetId,
			mediators: details.mediators?.map((m: any) => ({
				did: m.did,
			})) || [],
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

/**
 * Execute confidential assets operation
 */
export async function executeConfidentialAssetsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getConfidentialAsset':
			return getConfidentialAsset.call(this, index);
		case 'createConfidentialAsset':
			return createConfidentialAsset.call(this, index);
		case 'getConfidentialAccount':
			return getConfidentialAccount.call(this, index);
		case 'createConfidentialAccount':
			return createConfidentialAccount.call(this, index);
		case 'getConfidentialBalance':
			return getConfidentialBalance.call(this, index);
		case 'getConfidentialTransaction':
			return getConfidentialTransaction.call(this, index);
		case 'createConfidentialTransaction':
			return createConfidentialTransaction.call(this, index);
		case 'affirmConfidentialTransaction':
			return affirmConfidentialTransaction.call(this, index);
		case 'getAuditors':
			return getAuditors.call(this, index);
		case 'getMediators':
			return getMediators.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown confidential assets operation: ${operation}`,
			);
	}
}
