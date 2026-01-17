import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';

export async function getExternalAgents(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const agents = await asset.permissions.getAgents();
	
	return [{ json: {
		ticker,
		agents: agents.map(a => ({
			identity: a.agent.did,
			group: a.group?.toHuman?.() || a.group,
		})),
	} }];
}

export async function getAgentGroups(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const groups = await asset.permissions.getGroups();
	
	return [{ json: {
		ticker,
		knownGroups: ['Full', 'ExceptMeta', 'PolymeshV1CAA', 'PolymeshV1PIA'],
		customGroups: groups.custom.map(g => ({
			id: g.id.toString(),
			permissions: g.permissions?.toHuman?.() || g.permissions,
		})),
	} }];
}

export async function inviteExternalAgent(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const targetDid = this.getNodeParameter('targetDid', index) as string;
	const group = this.getNodeParameter('permissionGroup', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const target = await polymesh.identities.getIdentity({ did: targetDid });
	
	try {
		let permissionsGroup: any;
		
		// Known permission groups
		if (['Full', 'ExceptMeta', 'PolymeshV1CAA', 'PolymeshV1PIA'].includes(group)) {
			const groups = await asset.permissions.getGroups();
			permissionsGroup = groups.known.find(g => g.type === group);
		} else {
			// Custom group by ID
			const groups = await asset.permissions.getGroups();
			permissionsGroup = groups.custom.find(g => g.id.toString() === group);
		}
		
		if (!permissionsGroup) {
			throw new NodeOperationError(this.getNode(), `Permission group "${group}" not found`);
		}
		
		const tx = await asset.permissions.inviteAgent({
			target,
			permissions: permissionsGroup,
		});
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			targetDid,
			group,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function removeExternalAgent(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const agentDid = this.getNodeParameter('agentDid', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const agent = await polymesh.identities.getIdentity({ did: agentDid });
	
	try {
		const tx = await asset.permissions.removeAgent({ target: agent });
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			agentDid,
			removed: true,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function createCustomGroup(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const permissions = this.getNodeParameter('permissions', index) as { permissionValues: Array<{ type: string }> };
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	const transactionPermissions = permissions.permissionValues.map(p => p.type);
	
	try {
		const tx = await asset.permissions.createGroup({
			permissions: {
				transactions: {
					type: 'Include',
					values: transactionPermissions as any[],
				},
			},
		});
		
		const group = await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			groupId: group?.id?.toString(),
			permissions: transactionPermissions,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function setGroupPermissions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	const groupId = this.getNodeParameter('groupId', index) as string;
	const permissions = this.getNodeParameter('permissions', index) as { permissionValues: Array<{ type: string }> };
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	const groups = await asset.permissions.getGroups();
	const group = groups.custom.find(g => g.id.toString() === groupId);
	
	if (!group) {
		throw new NodeOperationError(this.getNode(), `Custom group ${groupId} not found`);
	}
	
	const transactionPermissions = permissions.permissionValues.map(p => p.type);
	
	try {
		const tx = await group.setPermissions({
			permissions: {
				transactions: {
					type: 'Include',
					values: transactionPermissions as any[],
				},
			},
		});
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			groupId,
			permissions: transactionPermissions,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function abdicateAgentRole(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ticker = this.getNodeParameter('ticker', index) as string;
	
	const polymesh = await getPolymeshClient.call(this);
	const asset = await polymesh.assets.getAsset({ ticker });
	
	try {
		const tx = await asset.permissions.abdicate();
		await waitForTransaction(tx);
		
		return [{ json: {
			success: true,
			ticker,
			abdicated: true,
			transactionHash: tx.txHash,
		} }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

/**
 * Execute external agents operation
 */
export async function executeExternalAgentsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getExternalAgents':
			return getExternalAgents.call(this, index);
		case 'getAgentGroups':
			return getAgentGroups.call(this, index);
		case 'inviteExternalAgent':
			return inviteExternalAgent.call(this, index);
		case 'removeExternalAgent':
			return removeExternalAgent.call(this, index);
		case 'createCustomGroup':
			return createCustomGroup.call(this, index);
		case 'setGroupPermissions':
			return setGroupPermissions.call(this, index);
		case 'abdicateAgentRole':
			return abdicateAgentRole.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown external agents operation: ${operation}`,
			);
	}
}
