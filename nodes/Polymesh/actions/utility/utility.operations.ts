import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError } from '../../transport/polymeshClient';
import { toMicroPolyx, fromMicroPolyx, formatPolyx } from '../../utils/unitConverter';
import { encodePolymeshAddress, decodePolymeshAddress, isValidDid, isValidAddress } from '../../utils/identityUtils';

export async function convertUnits(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const amount = this.getNodeParameter('amount', index) as string;
	const direction = this.getNodeParameter('conversionDirection', index) as string;
	
	let result: string;
	if (direction === 'toMicro') {
		result = toMicroPolyx(amount);
	} else {
		result = fromMicroPolyx(amount);
	}
	
	return [{ json: {
		input: amount,
		direction,
		result,
		formatted: direction === 'fromMicro' ? formatPolyx(amount) : undefined,
	} }];
}

export async function encodeAddress(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const publicKey = this.getNodeParameter('publicKey', index) as string;
	
	try {
		const address = encodePolymeshAddress(publicKey);
		return [{ json: { publicKey, address } }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to encode address: ${error}`);
	}
}

export async function decodeAddress(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	
	try {
		const publicKey = decodePolymeshAddress(address);
		return [{ json: { address, publicKey } }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to decode address: ${error}`);
	}
}

export async function validateDid(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', index) as string;
	const isValid = isValidDid(did);
	
	return [{ json: { did, isValid } }];
}

export async function validateAddress(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const isValid = isValidAddress(address);
	
	return [{ json: { address, isValid } }];
}

export async function getDidFromAddress(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const account = await polymesh.accountManagement.getAccount({ address });
	const identity = await account.getIdentity();
	
	return [{ json: {
		address,
		did: identity?.did || null,
		hasIdentity: !!identity,
	} }];
}

export async function getNetworkInformation(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	
	const network = await polymesh.network.getNetworkProperties();
	const latestBlock = await polymesh.network.getLatestBlock();
	const ss58Format = await polymesh.network.getSs58Format();
	
	return [{ json: {
		name: network.name,
		version: network.version?.toString(),
		latestBlock: latestBlock.toString(),
		ss58Format: ss58Format.toString(),
	} }];
}

export async function getProtocolFees(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tag = this.getNodeParameter('transactionTag', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const fees = await polymesh.network.getProtocolFees({ tags: [tag as any] });
	
	return [{ json: {
		transactionTag: tag,
		fees: fees.map(f => ({
			tag: f.tag,
			fees: f.fees?.toString(),
		})),
	} }];
}

export async function getBlockDetails(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockNumber = this.getNodeParameter('blockNumber', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	// Get block hash
	const blockHash = await polymesh._polkadotApi.rpc.chain.getBlockHash(parseInt(blockNumber));
	const block = await polymesh._polkadotApi.rpc.chain.getBlock(blockHash);
	
	return [{ json: {
		blockNumber,
		hash: blockHash.toHex(),
		parentHash: block.block.header.parentHash.toHex(),
		stateRoot: block.block.header.stateRoot.toHex(),
		extrinsicsCount: block.block.extrinsics.length,
	} }];
}

export async function estimateTransactionFee(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index, '') as string;
	const transactionType = this.getNodeParameter('transactionType', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	
	// Get protocol fees for estimation
	const fees = await polymesh.network.getProtocolFees({ tags: [transactionType as any] });
	
	return [{ json: {
		transactionType,
		ticker: ticker || undefined,
		estimatedFees: fees.map(f => ({
			tag: f.tag,
			fees: f.fees?.toString(),
		})),
		note: 'Actual fees may vary based on transaction complexity',
	} }];
}

export async function getLatestBlock(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	const latestBlock = await polymesh.network.getLatestBlock();
	
	return [{ json: { latestBlock: latestBlock.toString() } }];
}

export async function getChainMetadata(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	
	const metadata = polymesh._polkadotApi.runtimeMetadata;
	const version = polymesh._polkadotApi.runtimeVersion;
	
	return [{ json: {
		specName: version.specName.toString(),
		specVersion: version.specVersion.toString(),
		implName: version.implName.toString(),
		implVersion: version.implVersion.toString(),
		transactionVersion: version.transactionVersion.toString(),
		metadataVersion: metadata.version,
	} }];
}

// Main operation executor
export async function executeUtilityOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'convertUnits':
			return convertUnits.call(this, index);
		case 'encodeAddress':
			return encodeAddress.call(this, index);
		case 'decodeAddress':
			return decodeAddress.call(this, index);
		case 'validateDid':
			return validateDid.call(this, index);
		case 'validateAddress':
			return validateAddress.call(this, index);
		case 'getDidFromAddress':
			return getDidFromAddress.call(this, index);
		case 'getNetworkInformation':
			return getNetworkInformation.call(this, index);
		case 'getProtocolFees':
			return getProtocolFees.call(this, index);
		case 'getBlockDetails':
			return getBlockDetails.call(this, index);
		case 'estimateTransactionFee':
			return estimateTransactionFee.call(this, index);
		case 'getLatestBlock':
			return getLatestBlock.call(this, index);
		case 'getChainMetadata':
			return getChainMetadata.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown utility operation: ${operation}`);
	}
}
