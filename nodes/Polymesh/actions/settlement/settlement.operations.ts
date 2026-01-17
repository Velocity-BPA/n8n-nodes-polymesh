import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';
import { parseInstructionStatus, parseVenueType, formatInstructionForDisplay } from '../../utils/settlementUtils';

export async function executeSettlementOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	let result: any;

	try {
		switch (operation) {
			case 'getVenue': {
				const venueId = this.getNodeParameter('venueId', i) as string;
				const venue = await polymesh.settlements.getVenue({ id: BigInt(venueId) });
				const details = await venue.details();

				result = {
					id: venueId,
					type: parseVenueType(details.type),
					owner: details.owner?.did,
					description: details.description,
				};
				break;
			}

			case 'getVenueInstructions': {
				const venueId = this.getNodeParameter('venueId', i) as string;
				const venue = await polymesh.settlements.getVenue({ id: BigInt(venueId) });
				const instructions = await venue.getInstructions();

				result = {
					venueId,
					pending: instructions.pending.map((inst: any) => ({ id: inst.id.toString() })),
					affirmed: instructions.affirmed.map((inst: any) => ({ id: inst.id.toString() })),
					failed: instructions.failed.map((inst: any) => ({ id: inst.id.toString() })),
				};
				break;
			}

			case 'createVenue': {
				const venueType = this.getNodeParameter('venueType', i) as string;
				const description = this.getNodeParameter('description', i, '') as string;

				const createParams: any = { type: venueType };
				if (description) createParams.description = description;

				const tx = await polymesh.settlements.createVenue(createParams);
				const venue = await waitForTransaction(tx);

				result = {
					success: true,
					venueId: venue.id.toString(),
					type: venueType,
					description: description || null,
				};
				break;
			}

			case 'getInstruction': {
				const instructionId = this.getNodeParameter('instructionId', i) as string;
				const instruction = await polymesh.settlements.getInstruction({ id: BigInt(instructionId) });
				const details = await instruction.details();
				const legs = await instruction.getLegs();
				const status = await instruction.getStatus();

				result = {
					id: instructionId,
					venueId: details.venue?.id.toString(),
					status: parseInstructionStatus(status.status),
					createdAt: details.createdAt?.toISOString(),
					tradeDate: details.tradeDate?.toISOString(),
					valueDate: details.valueDate?.toISOString(),
					type: details.type,
					legs: legs.data.map((leg: any) => ({
						from: leg.from?.owner?.did,
						to: leg.to?.owner?.did,
						asset: leg.asset?.ticker,
						amount: leg.amount?.toString(),
					})),
				};
				break;
			}

			case 'getInstructionLegs': {
				const instructionId = this.getNodeParameter('instructionId', i) as string;
				const instruction = await polymesh.settlements.getInstruction({ id: BigInt(instructionId) });
				const legs = await instruction.getLegs();

				result = {
					instructionId,
					count: legs.data.length,
					legs: legs.data.map((leg: any, idx: number) => ({
						index: idx,
						from: { did: leg.from?.owner?.did, portfolio: leg.from?.id?.toString() || '0' },
						to: { did: leg.to?.owner?.did, portfolio: leg.to?.id?.toString() || '0' },
						asset: leg.asset?.ticker,
						amount: leg.amount?.toString(),
					})),
				};
				break;
			}

			case 'addInstruction': {
				const venueId = this.getNodeParameter('venueId', i) as string;
				const legsData = this.getNodeParameter('legs', i) as any;

				const venue = await polymesh.settlements.getVenue({ id: BigInt(venueId) });

				const legs = legsData.leg.map((l: any) => ({
					from: l.fromPortfolio ? { identity: l.fromDid, id: BigInt(l.fromPortfolio) } : l.fromDid,
					to: l.toPortfolio ? { identity: l.toDid, id: BigInt(l.toPortfolio) } : l.toDid,
					asset: l.ticker,
					amount: BigInt(l.amount),
				}));

				const tx = await venue.addInstruction({ legs });
				const instruction = await waitForTransaction(tx);

				result = {
					success: true,
					instructionId: instruction.id.toString(),
					venueId,
					legCount: legs.length,
				};
				break;
			}

			case 'affirmInstruction': {
				const instructionId = this.getNodeParameter('instructionId', i) as string;

				const instruction = await polymesh.settlements.getInstruction({ id: BigInt(instructionId) });
				const tx = await instruction.affirm();
				await waitForTransaction(tx);

				result = {
					success: true,
					instructionId,
					affirmed: true,
				};
				break;
			}

			case 'withdrawAffirmation': {
				const instructionId = this.getNodeParameter('instructionId', i) as string;

				const instruction = await polymesh.settlements.getInstruction({ id: BigInt(instructionId) });
				const tx = await instruction.withdraw();
				await waitForTransaction(tx);

				result = {
					success: true,
					instructionId,
					withdrawn: true,
				};
				break;
			}

			case 'rejectInstruction': {
				const instructionId = this.getNodeParameter('instructionId', i) as string;

				const instruction = await polymesh.settlements.getInstruction({ id: BigInt(instructionId) });
				const tx = await instruction.reject();
				await waitForTransaction(tx);

				result = {
					success: true,
					instructionId,
					rejected: true,
				};
				break;
			}

			case 'executeInstruction': {
				const instructionId = this.getNodeParameter('instructionId', i) as string;

				const instruction = await polymesh.settlements.getInstruction({ id: BigInt(instructionId) });
				const tx = await instruction.executeManually({ skipAffirmationCheck: false });
				await waitForTransaction(tx);

				result = {
					success: true,
					instructionId,
					executed: true,
				};
				break;
			}

			case 'getPendingInstructions': {
				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const instructions = await signingIdentity.getInstructions();

				result = {
					did: signingIdentity.did,
					pending: instructions.pending.map((inst: any) => ({
						id: inst.id.toString(),
					})),
					affirmed: instructions.affirmed.map((inst: any) => ({
						id: inst.id.toString(),
					})),
				};
				break;
			}

			case 'getInstructionAffirmations': {
				const instructionId = this.getNodeParameter('instructionId', i) as string;

				const instruction = await polymesh.settlements.getInstruction({ id: BigInt(instructionId) });
				const affirmations = await instruction.getAffirmations();

				result = {
					instructionId,
					affirmations: affirmations.data.map((a: any) => ({
						identity: a.identity?.did,
						status: a.status,
					})),
				};
				break;
			}

			case 'getMyVenues': {
				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const venues = await signingIdentity.getVenues();

				result = {
					did: signingIdentity.did,
					count: venues.length,
					venues: await Promise.all(venues.map(async (v: any) => {
						const details = await v.details();
						return {
							id: v.id.toString(),
							type: parseVenueType(details.type),
							description: details.description,
						};
					})),
				};
				break;
			}

			default:
				throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
		}

		return [{ json: result }];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatPolymeshError(error));
	}
}
