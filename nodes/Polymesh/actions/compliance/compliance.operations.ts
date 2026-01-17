import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';
import { formatComplianceForDisplay, buildComplianceFromTemplate } from '../../utils/complianceUtils';

export async function executeComplianceOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	let result: any;

	try {
		switch (operation) {
			case 'getRequirements': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const asset = await polymesh.assets.getAsset({ ticker });
				const compliance = await asset.compliance.requirements.get();

				result = {
					ticker,
					requirements: compliance.requirements.map((req: any, idx: number) => ({
						id: idx,
						conditions: req.conditions,
					})),
				};
				break;
			}

			case 'addRequirement': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const conditions = this.getNodeParameter('conditions', i) as any;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.compliance.requirements.add({ conditions: conditions.condition || [] });
				await waitForTransaction(tx);

				result = { success: true, ticker, message: 'Requirement added' };
				break;
			}

			case 'removeRequirement': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const requirementId = this.getNodeParameter('requirementId', i) as number;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.compliance.requirements.remove({ requirement: requirementId });
				await waitForTransaction(tx);

				result = { success: true, ticker, removedId: requirementId };
				break;
			}

			case 'resetCompliance': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.compliance.requirements.reset();
				await waitForTransaction(tx);

				result = { success: true, ticker, message: 'Compliance reset' };
				break;
			}

			case 'pauseCompliance': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.compliance.requirements.pause();
				await waitForTransaction(tx);

				result = { success: true, ticker, paused: true };
				break;
			}

			case 'resumeCompliance': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.compliance.requirements.unpause();
				await waitForTransaction(tx);

				result = { success: true, ticker, paused: false };
				break;
			}

			case 'getTrustedClaimIssuers': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const issuers = await asset.compliance.trustedClaimIssuers.get();

				result = {
					ticker,
					issuers: issuers.map((issuer: any) => ({
						did: issuer.identity?.did,
						trustedFor: issuer.trustedFor,
					})),
				};
				break;
			}

			case 'addTrustedClaimIssuer': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const issuerDid = this.getNodeParameter('issuerDid', i) as string;
				const trustedFor = this.getNodeParameter('trustedFor', i) as string[];

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.compliance.trustedClaimIssuers.add({
					claimIssuers: [{ identity: issuerDid, trustedFor }],
				});
				await waitForTransaction(tx);

				result = { success: true, ticker, issuer: issuerDid, trustedFor };
				break;
			}

			case 'removeTrustedClaimIssuer': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const issuerDid = this.getNodeParameter('issuerDid', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.compliance.trustedClaimIssuers.remove({
					claimIssuers: [issuerDid],
				});
				await waitForTransaction(tx);

				result = { success: true, ticker, removedIssuer: issuerDid };
				break;
			}

			case 'validateTransfer': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const fromDid = this.getNodeParameter('fromDid', i) as string;
				const toDid = this.getNodeParameter('toDid', i) as string;
				const amount = this.getNodeParameter('amount', i, '1') as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const canTransfer = await asset.settlements.canTransfer({
					from: fromDid,
					to: toDid,
					amount: BigInt(amount),
				});

				result = {
					ticker,
					from: fromDid,
					to: toDid,
					amount,
					canTransfer: canTransfer.result,
					reason: canTransfer.reason,
				};
				break;
			}

			case 'applyTemplate': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const template = this.getNodeParameter('template', i) as string;

				const compliance = buildComplianceFromTemplate(template);
				const asset = await polymesh.assets.getAsset({ ticker });

				await asset.compliance.requirements.reset();
				for (const req of compliance) {
					const tx = await asset.compliance.requirements.add({ conditions: (req as any).conditions });
					await waitForTransaction(tx);
				}

				result = { success: true, ticker, template, requirementsAdded: compliance.length };
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
