import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';

export async function getMultiSigAccount(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const account = await polymesh.accountManagement.getAccount({ address });
	
	const isMultiSig = await account.isMultiSig();
	if (!isMultiSig) {
		return [{ json: { address, isMultiSig: false } }];
	}
	
	const multiSig = await account.getMultiSig();
	const signers = await multiSig?.getSigners();
	const requiredSignatures = await multiSig?.getRequiredSignatures();
	
	return [{ json: {
		address,
		isMultiSig: true,
		signers: signers?.map((s: any) => s.address) || [],
		requiredSignatures: requiredSignatures?.toString(),
	} }];
}

export async function createMultiSig(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const signers = this.getNodeParameter('signers', index) as string;
	const requiredSignatures = this.getNodeParameter('requiredSignatures', index) as number;
	
	const polymesh = await getPolymeshClient.call(this);
	const signerAddresses = signers.split(',').map(s => s.trim());
	
	try {
		const tx = await polymesh.accountManagement.createMultiSigAccount({
			signers: signerAddresses.map(address => ({ address })),
			requiredSignatures: BigInt(requiredSignatures),
		});
		
		const result = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			multiSigAddress: result?.address,
			signers: signerAddresses,
			requiredSignatures,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getMultiSigProposals(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const account = await polymesh.accountManagement.getAccount({ address });
	const multiSig = await account.getMultiSig();
	
	if (!multiSig) {
		throw new NodeOperationError(this.getNode(), 'Account is not a multi-sig');
	}
	
	const proposals = await multiSig.getProposals();
	
	return [{ json: {
		address,
		proposals: proposals.map((p: any) => ({
			id: p.id.toString(),
			status: p.status,
			approvalCount: p.approvalCount?.toString(),
			rejectionCount: p.rejectionCount?.toString(),
			expiry: p.expiry,
		})),
	} }];
}

export async function approveProposal(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const account = await polymesh.accountManagement.getAccount({ address });
	const multiSig = await account.getMultiSig();
	
	if (!multiSig) {
		throw new NodeOperationError(this.getNode(), 'Account is not a multi-sig');
	}
	
	const proposal = await multiSig.getProposal({ id: BigInt(proposalId) });
	
	try {
		const tx = await proposal.approve();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			address,
			proposalId,
			action: 'approved',
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function rejectProposal(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const proposalId = this.getNodeParameter('proposalId', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const account = await polymesh.accountManagement.getAccount({ address });
	const multiSig = await account.getMultiSig();
	
	if (!multiSig) {
		throw new NodeOperationError(this.getNode(), 'Account is not a multi-sig');
	}
	
	const proposal = await multiSig.getProposal({ id: BigInt(proposalId) });
	
	try {
		const tx = await proposal.reject();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			address,
			proposalId,
			action: 'rejected',
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getMultiSigSigners(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const account = await polymesh.accountManagement.getAccount({ address });
	const multiSig = await account.getMultiSig();
	
	if (!multiSig) {
		throw new NodeOperationError(this.getNode(), 'Account is not a multi-sig');
	}
	
	const signers = await multiSig.getSigners();
	
	return [{ json: {
		address,
		signers: signers.map((s: any) => ({
			address: s.address,
		})),
	} }];
}

export async function getRequiredSignatures(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const account = await polymesh.accountManagement.getAccount({ address });
	const multiSig = await account.getMultiSig();
	
	if (!multiSig) {
		throw new NodeOperationError(this.getNode(), 'Account is not a multi-sig');
	}
	
	const required = await multiSig.getRequiredSignatures();
	
	return [{ json: { address, requiredSignatures: required.toString() } }];
}

export async function modifySigners(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const action = this.getNodeParameter('signerAction', index) as string;
	const signerAddress = this.getNodeParameter('signerAddress', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const account = await polymesh.accountManagement.getAccount({ address });
	const multiSig = await account.getMultiSig();
	
	if (!multiSig) {
		throw new NodeOperationError(this.getNode(), 'Account is not a multi-sig');
	}
	
	try {
		let tx: any;
		if (action === 'add') {
			tx = await multiSig.modifySigners({
				signers: [{ address: signerAddress }],
			});
		} else {
			tx = await multiSig.modifySigners({
				signers: [{ address: signerAddress }],
			});
		}
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			address,
			action,
			signerAddress,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

/**
 * Execute multi-sig operation
 */
export async function executeMultiSigOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getMultiSigAccount':
			return getMultiSigAccount.call(this, index);
		case 'createMultiSig':
			return createMultiSig.call(this, index);
		case 'getMultiSigProposals':
			return getMultiSigProposals.call(this, index);
		case 'approveProposal':
			return approveProposal.call(this, index);
		case 'rejectProposal':
			return rejectProposal.call(this, index);
		case 'getMultiSigSigners':
			return getMultiSigSigners.call(this, index);
		case 'getRequiredSignatures':
			return getRequiredSignatures.call(this, index);
		case 'modifySigners':
			return modifySigners.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown multi-sig operation: ${operation}`,
			);
	}
}
