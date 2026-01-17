import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';
import { formatPolyx } from '../../utils/unitConverter';
import { TICKER_REGEX, ISIN_REGEX, CUSIP_REGEX, LEI_REGEX } from '../../constants/assetIdentifiers';

export async function executeAssetOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	let result: any;

	try {
		switch (operation) {
			case 'getAsset': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				if (!TICKER_REGEX.test(ticker)) {
					throw new NodeOperationError(this.getNode(), 'Invalid ticker format (1-12 uppercase alphanumeric)');
				}

				const asset = await polymesh.assets.getAsset({ ticker });
				const details = await asset.details();
				const totalSupply = await asset.currentFundingRound();

				result = {
					ticker: asset.ticker,
					did: asset.did,
					name: details.name,
					assetType: details.assetType,
					isDivisible: details.isDivisible,
					owner: details.owner?.did,
					totalSupply: details.totalSupply?.toString(),
					fundingRound: totalSupply || null,
					isFrozen: details.isFrozen,
					fullAgents: details.fullAgents?.map((a: any) => a.did) || [],
				};
				break;
			}

			case 'getAssetDocuments': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const documents = await asset.documents.get();

				result = {
					ticker,
					count: documents.data.length,
					documents: documents.data.map((doc: any) => ({
						name: doc.name,
						uri: doc.uri,
						type: doc.type,
						contentHash: doc.contentHash,
						filedAt: doc.filedAt?.toISOString(),
					})),
				};
				break;
			}

			case 'getAssetCompliance': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const compliance = await asset.compliance.requirements.get();

				result = {
					ticker,
					isPaused: compliance.requirements.length === 0,
					requirements: compliance.requirements.map((req: any, idx: number) => ({
						id: idx,
						conditions: req.conditions?.map((c: any) => ({
							type: c.type,
							target: c.target,
							claim: c.claim,
							trustedClaimIssuers: c.trustedClaimIssuers?.map((i: any) => i.did),
						})),
					})),
				};
				break;
			}

			case 'getAssetHolders': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const limit = this.getNodeParameter('limit', i, 50) as number;

				const asset = await polymesh.assets.getAsset({ ticker });
				const holders = await asset.assetHolders.get({ size: limit });

				result = {
					ticker,
					count: holders.data.length,
					holders: holders.data.map((h: any) => ({
						did: h.identity.did,
						balance: h.balance.toString(),
					})),
				};
				break;
			}

			case 'getAssetIssuance': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const details = await asset.details();

				result = {
					ticker,
					totalSupply: details.totalSupply?.toString(),
					isDivisible: details.isDivisible,
					owner: details.owner?.did,
				};
				break;
			}

			case 'createAsset': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const name = this.getNodeParameter('name', i) as string;
				const assetType = this.getNodeParameter('assetType', i) as string;
				const isDivisible = this.getNodeParameter('isDivisible', i, true) as boolean;
				const fundingRound = this.getNodeParameter('fundingRound', i, '') as string;
				const initialSupply = this.getNodeParameter('initialSupply', i, '0') as string;

				if (!TICKER_REGEX.test(ticker)) {
					throw new NodeOperationError(this.getNode(), 'Invalid ticker format');
				}

				const createParams: any = {
					ticker,
					name,
					assetType,
					isDivisible,
				};

				if (fundingRound) {
					createParams.fundingRound = fundingRound;
				}

				if (initialSupply && initialSupply !== '0') {
					createParams.initialSupply = BigInt(initialSupply);
				}

				const tx = await polymesh.assets.createAsset(createParams);
				const asset = await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					did: asset.did,
					name,
					assetType,
					isDivisible,
				};
				break;
			}

			case 'issueTokens': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const amount = this.getNodeParameter('amount', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.issuance.issue({ amount: BigInt(amount) });
				await waitForTransaction(tx);

				const details = await asset.details();

				result = {
					success: true,
					ticker,
					amountIssued: amount,
					newTotalSupply: details.totalSupply?.toString(),
				};
				break;
			}

			case 'redeemTokens': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const amount = this.getNodeParameter('amount', i) as string;
				const fromPortfolio = this.getNodeParameter('fromPortfolio', i, 0) as number;

				const asset = await polymesh.assets.getAsset({ ticker });

				const redeemParams: any = {
					amount: BigInt(amount),
				};

				if (fromPortfolio > 0) {
					redeemParams.from = fromPortfolio;
				}

				const tx = await asset.redeem(redeemParams);
				await waitForTransaction(tx);

				const details = await asset.details();

				result = {
					success: true,
					ticker,
					amountRedeemed: amount,
					newTotalSupply: details.totalSupply?.toString(),
				};
				break;
			}

			case 'freezeAsset': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.freeze();
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					isFrozen: true,
				};
				break;
			}

			case 'unfreezeAsset': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.unfreeze();
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					isFrozen: false,
				};
				break;
			}

			case 'addDocument': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const docName = this.getNodeParameter('docName', i) as string;
				const docUri = this.getNodeParameter('docUri', i) as string;
				const docType = this.getNodeParameter('docType', i, '') as string;
				const contentHash = this.getNodeParameter('contentHash', i, '') as string;

				const asset = await polymesh.assets.getAsset({ ticker });

				const docParams: any = {
					name: docName,
					uri: docUri,
				};

				if (docType) docParams.type = docType;
				if (contentHash) docParams.contentHash = contentHash;

				const tx = await asset.documents.set({ documents: [docParams] });
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					document: docParams,
				};
				break;
			}

			case 'removeDocument': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const docName = this.getNodeParameter('docName', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const docs = await asset.documents.get();
				const filteredDocs = docs.data.filter((d: any) => d.name !== docName);

				const tx = await asset.documents.set({ documents: filteredDocs });
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					removedDocument: docName,
				};
				break;
			}

			case 'getAssetMetadata': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const metadata = await asset.metadata.get();

				result = {
					ticker,
					entries: metadata.map((m: any) => ({
						key: m.key,
						value: m.value,
						lockedUntil: m.lockedUntil?.toISOString(),
					})),
				};
				break;
			}

			case 'setAssetMetadata': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const metadataKey = this.getNodeParameter('metadataKey', i) as string;
				const metadataValue = this.getNodeParameter('metadataValue', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.metadata.set({
					key: metadataKey,
					value: metadataValue,
				});
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					key: metadataKey,
					value: metadataValue,
				};
				break;
			}

			case 'getAssetIdentifiers': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const identifiers = await asset.getIdentifiers();

				result = {
					ticker,
					identifiers: identifiers.map((id: any) => ({
						type: id.type,
						value: id.value,
					})),
				};
				break;
			}

			case 'addAssetIdentifier': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const identifierType = this.getNodeParameter('identifierType', i) as string;
				const identifierValue = this.getNodeParameter('identifierValue', i) as string;

				// Validate identifier format
				if (identifierType === 'Isin' && !ISIN_REGEX.test(identifierValue)) {
					throw new NodeOperationError(this.getNode(), 'Invalid ISIN format');
				}
				if (identifierType === 'Cusip' && !CUSIP_REGEX.test(identifierValue)) {
					throw new NodeOperationError(this.getNode(), 'Invalid CUSIP format');
				}
				if (identifierType === 'Lei' && !LEI_REGEX.test(identifierValue)) {
					throw new NodeOperationError(this.getNode(), 'Invalid LEI format');
				}

				const asset = await polymesh.assets.getAsset({ ticker });
				const currentIdentifiers = await asset.getIdentifiers();

				const newIdentifiers = [
					...currentIdentifiers,
					{ type: identifierType, value: identifierValue },
				];

				const tx = await asset.modify({ identifiers: newIdentifiers });
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					addedIdentifier: {
						type: identifierType,
						value: identifierValue,
					},
				};
				break;
			}

			case 'controllerTransfer': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const originDid = this.getNodeParameter('originDid', i) as string;
				const amount = this.getNodeParameter('amount', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.controllerTransfer({
					originPortfolio: { identity: originDid },
					amount: BigInt(amount),
				});
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					from: originDid,
					amount,
				};
				break;
			}

			case 'makeDivisible': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const details = await asset.details();

				if (details.isDivisible) {
					throw new NodeOperationError(this.getNode(), 'Asset is already divisible');
				}

				const tx = await asset.modify({ makeDivisible: true });
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					isDivisible: true,
				};
				break;
			}

			case 'renameAsset': {
				const ticker = this.getNodeParameter('ticker', i) as string;
				const newName = this.getNodeParameter('newName', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const tx = await asset.modify({ name: newName });
				await waitForTransaction(tx);

				result = {
					success: true,
					ticker,
					newName,
				};
				break;
			}

			case 'getAssetStatistics': {
				const ticker = this.getNodeParameter('ticker', i) as string;

				const asset = await polymesh.assets.getAsset({ ticker });
				const stats = await asset.transferRestrictions.count.get();

				result = {
					ticker,
					restrictions: stats,
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
