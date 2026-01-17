import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction, getSigningIdentity } from '../../transport/polymeshClient';

export async function getPendingAuthorizations(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', index, '') as string;
	const authType = this.getNodeParameter('authorizationType', index, '') as string;
	
	const polymesh = await getPolymeshClient.call(this);
	let identity;
	
	if (did) {
		identity = await polymesh.identities.getIdentity({ did });
	} else {
		identity = await getSigningIdentity.call(this);
	}
	
	const authorizations = await identity.authorizations.getReceived({ type: authType || undefined });
	
	return [{ json: {
		did: identity.did,
		authorizations: authorizations.data.map(auth => ({
			id: auth.authId.toString(),
			type: auth.data.type,
			issuer: auth.issuer.did,
			expiry: auth.expiry,
			data: auth.data,
		})),
	} }];
}

export async function getSentAuthorizations(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const did = this.getNodeParameter('did', index, '') as string;
	
	const polymesh = await getPolymeshClient.call(this);
	let identity;
	
	if (did) {
		identity = await polymesh.identities.getIdentity({ did });
	} else {
		identity = await getSigningIdentity.call(this);
	}
	
	const authorizations = await identity.authorizations.getSent();
	
	return [{ json: {
		did: identity.did,
		authorizations: authorizations.data.map(auth => ({
			id: auth.authId.toString(),
			type: auth.data.type,
			target: auth.target?.did,
			expiry: auth.expiry,
			data: auth.data,
		})),
	} }];
}

export async function getAuthorizationDetails(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const authId = this.getNodeParameter('authorizationId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const identity = await getSigningIdentity.call(this);
	
	const authorization = await identity.authorizations.getOne({ id: BigInt(authId) });
	
	return [{ json: {
		id: authorization.authId.toString(),
		type: authorization.data.type,
		issuer: authorization.issuer.did,
		target: authorization.target?.did,
		expiry: authorization.expiry,
		data: authorization.data,
	} }];
}

export async function acceptAuthorization(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const authId = this.getNodeParameter('authorizationId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const identity = await getSigningIdentity.call(this);
	
	const authorization = await identity.authorizations.getOne({ id: BigInt(authId) });
	
	try {
		const tx = await authorization.accept();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			authorizationId: authId,
			action: 'accepted',
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function rejectAuthorization(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const authId = this.getNodeParameter('authorizationId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const identity = await getSigningIdentity.call(this);
	
	const authorization = await identity.authorizations.getOne({ id: BigInt(authId) });
	
	try {
		const tx = await authorization.remove();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			authorizationId: authId,
			action: 'rejected',
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function removeAuthorization(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const authId = this.getNodeParameter('authorizationId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const identity = await getSigningIdentity.call(this);
	
	const sentAuths = await identity.authorizations.getSent();
	const authorization = sentAuths.data.find(a => a.authId.toString() === authId);
	
	if (!authorization) {
		throw new NodeOperationError(this.getNode(), 'Authorization not found in sent authorizations');
	}
	
	try {
		const tx = await authorization.remove();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			authorizationId: authId,
			action: 'removed',
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getAuthorizationTypes(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const types = [
		'AddMultiSigSigner',
		'AddRelayerPayingKey',
		'AttestPrimaryKeyRotation',
		'BecomeAgent',
		'JoinIdentity',
		'PortfolioCustody',
		'RotatePrimaryKey',
		'RotatePrimaryKeyToSecondary',
		'TransferAssetOwnership',
		'TransferPrimaryIssuanceAgent',
		'TransferTicker',
	];
	
	return [{ json: { types } }];
}

/**
 * Execute authorizations operation
 */
export async function executeAuthorizationsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getPendingAuthorizations':
			return getPendingAuthorizations.call(this, index);
		case 'getSentAuthorizations':
			return getSentAuthorizations.call(this, index);
		case 'getAuthorizationDetails':
			return getAuthorizationDetails.call(this, index);
		case 'acceptAuthorization':
			return acceptAuthorization.call(this, index);
		case 'rejectAuthorization':
			return rejectAuthorization.call(this, index);
		case 'removeAuthorization':
			return removeAuthorization.call(this, index);
		case 'getAuthorizationTypes':
			return getAuthorizationTypes.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown authorizations operation: ${operation}`,
			);
	}
}
