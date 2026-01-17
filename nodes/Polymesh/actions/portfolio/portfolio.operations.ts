import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';

export async function executePortfolioOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	let result: any;

	try {
		switch (operation) {
			case 'getPortfolio': {
				const did = this.getNodeParameter('did', i) as string;
				const portfolioId = this.getNodeParameter('portfolioId', i, 0) as number;

				const identity = await polymesh.identities.getIdentity({ did });
				const portfolio = portfolioId === 0
					? await identity.portfolios.getPortfolio()
					: await identity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });

				const assets = await portfolio.getAssetBalances();
				const custodian = await portfolio.getCustodian();

				result = {
					did,
					portfolioId: portfolioId.toString(),
					name: portfolio.name || 'Default',
					custodian: custodian?.did,
					assets: assets.map((a: any) => ({
						ticker: a.asset.ticker,
						total: a.total.toString(),
						locked: a.locked.toString(),
						free: a.free.toString(),
					})),
				};
				break;
			}

			case 'getMyPortfolios': {
				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const portfolios = await signingIdentity.portfolios.getPortfolios();

				result = {
					did: signingIdentity.did,
					count: portfolios.length,
					portfolios: await Promise.all(portfolios.map(async (p: any) => {
						const custodian = await p.getCustodian();
						return {
							id: p.id?.toString() || '0',
							name: p.name || 'Default',
							custodian: custodian?.did,
						};
					})),
				};
				break;
			}

			case 'getPortfolioAssets': {
				const did = this.getNodeParameter('did', i) as string;
				const portfolioId = this.getNodeParameter('portfolioId', i, 0) as number;

				const identity = await polymesh.identities.getIdentity({ did });
				const portfolio = portfolioId === 0
					? await identity.portfolios.getPortfolio()
					: await identity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });

				const assets = await portfolio.getAssetBalances();

				result = {
					did,
					portfolioId: portfolioId.toString(),
					assets: assets.map((a: any) => ({
						ticker: a.asset.ticker,
						total: a.total.toString(),
						locked: a.locked.toString(),
						free: a.free.toString(),
					})),
				};
				break;
			}

			case 'createPortfolio': {
				const name = this.getNodeParameter('name', i) as string;

				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const tx = await signingIdentity.portfolios.create({ name });
				const portfolio = await waitForTransaction(tx);

				result = {
					success: true,
					portfolioId: portfolio.id?.toString(),
					name,
				};
				break;
			}

			case 'deletePortfolio': {
				const portfolioId = this.getNodeParameter('portfolioId', i) as number;

				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const portfolio = await signingIdentity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });
				const tx = await portfolio.delete();
				await waitForTransaction(tx);

				result = { success: true, deletedPortfolioId: portfolioId };
				break;
			}

			case 'renamePortfolio': {
				const portfolioId = this.getNodeParameter('portfolioId', i) as number;
				const newName = this.getNodeParameter('newName', i) as string;

				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const portfolio = await signingIdentity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });
				const tx = await portfolio.modifyName({ name: newName });
				await waitForTransaction(tx);

				result = { success: true, portfolioId, newName };
				break;
			}

			case 'moveAssets': {
				const fromPortfolioId = this.getNodeParameter('fromPortfolioId', i) as number;
				const toPortfolioId = this.getNodeParameter('toPortfolioId', i) as number;
				const ticker = this.getNodeParameter('ticker', i) as string;
				const amount = this.getNodeParameter('amount', i) as string;

				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const fromPortfolio = fromPortfolioId === 0
					? await signingIdentity.portfolios.getPortfolio()
					: await signingIdentity.portfolios.getPortfolio({ portfolioId: BigInt(fromPortfolioId) });

				const toPortfolio = toPortfolioId === 0
					? await signingIdentity.portfolios.getPortfolio()
					: await signingIdentity.portfolios.getPortfolio({ portfolioId: BigInt(toPortfolioId) });

				const tx = await fromPortfolio.moveFunds({
					to: toPortfolio,
					items: [{ asset: ticker, amount: BigInt(amount) }],
				});
				await waitForTransaction(tx);

				result = {
					success: true,
					from: fromPortfolioId,
					to: toPortfolioId,
					ticker,
					amount,
				};
				break;
			}

			case 'setCustodian': {
				const portfolioId = this.getNodeParameter('portfolioId', i, 0) as number;
				const custodianDid = this.getNodeParameter('custodianDid', i) as string;

				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const portfolio = portfolioId === 0
					? await signingIdentity.portfolios.getPortfolio()
					: await signingIdentity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });

				const tx = await portfolio.setCustodian({ targetIdentity: custodianDid });
				await waitForTransaction(tx);

				result = {
					success: true,
					portfolioId,
					newCustodian: custodianDid,
					note: 'Custodian must accept the authorization',
				};
				break;
			}

			case 'quitCustody': {
				const did = this.getNodeParameter('did', i) as string;
				const portfolioId = this.getNodeParameter('portfolioId', i, 0) as number;

				const identity = await polymesh.identities.getIdentity({ did });
				const portfolio = portfolioId === 0
					? await identity.portfolios.getPortfolio()
					: await identity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });

				const tx = await portfolio.quitCustody();
				await waitForTransaction(tx);

				result = { success: true, portfolioId, custodyQuit: true };
				break;
			}

			case 'getCustodian': {
				const did = this.getNodeParameter('did', i) as string;
				const portfolioId = this.getNodeParameter('portfolioId', i, 0) as number;

				const identity = await polymesh.identities.getIdentity({ did });
				const portfolio = portfolioId === 0
					? await identity.portfolios.getPortfolio()
					: await identity.portfolios.getPortfolio({ portfolioId: BigInt(portfolioId) });

				const custodian = await portfolio.getCustodian();
				const isCustodiedByOwner = await portfolio.isCustodiedBy({ identity: did });

				result = {
					did,
					portfolioId: portfolioId.toString(),
					custodian: custodian?.did,
					isCustodiedByOwner,
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
