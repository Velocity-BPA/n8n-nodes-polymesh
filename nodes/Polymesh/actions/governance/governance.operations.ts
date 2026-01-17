import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';
import { executeQuery, GET_PIPS } from '../../transport/middlewareClient';

export async function getActivePips(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	
	// Use middleware for comprehensive PIP data
	try {
		const result = await executeQuery.call(this, GET_PIPS, { status: 'Pending' });
		return [{ json: { pips: result.proposals?.nodes || [] } }];
	} catch {
		// Fallback - PIPs may not be directly accessible without middleware
		return [{ json: { pips: [], note: 'Middleware required for full PIP data' } }];
	}
}

export async function getPipDetails(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const pipId = this.getNodeParameter('pipId', index) as string;
	
	try {
		const result = await executeQuery.call(this, GET_PIPS, { pipId: parseInt(pipId) });
		const pip = result.proposals?.nodes?.[0];
		
		if (!pip) {
			throw new NodeOperationError(this.getNode(), `PIP ${pipId} not found`);
		}
		
		return [{ json: pip }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}

export async function getGovernanceParameters(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	const network = await polymesh.network.getNetworkProperties();
	
	return [{ json: {
		networkName: network.name,
		version: network.version?.toString(),
		// Governance parameters would require chain state queries
		note: 'Query chain state for detailed governance parameters',
	} }];
}

export async function getCommitteeMembers(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const committee = this.getNodeParameter('committee', index) as string;
	
	// Committee member queries require chain state access
	return [{ json: {
		committee,
		members: [],
		note: 'Committee member queries require middleware or chain state access',
	} }];
}

export async function getHistoricalPips(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const status = this.getNodeParameter('pipStatus', index, '') as string;
	
	try {
		const result = await executeQuery.call(this, GET_PIPS, { status: status || undefined });
		return [{ json: { pips: result.proposals?.nodes || [] } }];
	} catch {
		return [{ json: { pips: [], note: 'Middleware required for historical PIP data' } }];
	}
}

export async function getUpcomingUpgrades(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	
	// Get scheduled upgrades from chain
	const network = await polymesh.network.getNetworkProperties();
	
	return [{ json: {
		currentVersion: network.version?.toString(),
		scheduledUpgrades: [],
		note: 'Query chain state for scheduled upgrade details',
	} }];
}

export async function getNetworkInfo(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	
	const network = await polymesh.network.getNetworkProperties();
	const latestBlock = await polymesh.network.getLatestBlock();
	
	return [{ json: {
		name: network.name,
		version: network.version?.toString(),
		latestBlock: latestBlock.toString(),
	} }];
}

export async function getTreasuryBalance(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	
	// Treasury balance requires chain state query
	return [{ json: {
		balance: null,
		note: 'Treasury balance requires chain state query',
	} }];
}

/**
 * Execute governance operation
 */
export async function executeGovernanceOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getActivePips':
			return getActivePips.call(this, index);
		case 'getPipDetails':
			return getPipDetails.call(this, index);
		case 'getGovernanceParameters':
			return getGovernanceParameters.call(this, index);
		case 'getCommitteeMembers':
			return getCommitteeMembers.call(this, index);
		case 'getHistoricalPips':
			return getHistoricalPips.call(this, index);
		case 'getUpcomingUpgrades':
			return getUpcomingUpgrades.call(this, index);
		case 'getNetworkInfo':
			return getNetworkInfo.call(this, index);
		case 'getTreasuryBalance':
			return getTreasuryBalance.call(this, index);
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown governance operation: ${operation}`,
			);
	}
}
