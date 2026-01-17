import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';
import { toMicroPolyx, fromMicroPolyx, formatPolyx } from '../../utils/unitConverter';
import { isValidAddress, encodePolymeshAddress } from '../../utils/identityUtils';

export async function executeAccountOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	let result: any;

	try {
		switch (operation) {
			case 'getBalance': {
				const address = this.getNodeParameter('address', i) as string;
				
				if (!isValidAddress(address)) {
					throw new NodeOperationError(this.getNode(), 'Invalid Polymesh address format');
				}

				const account = await polymesh.accountManagement.getAccount({ address });
				const balance = await account.getBalance();
				
				result = {
					address,
					free: formatPolyx(balance.free.toString()),
					locked: formatPolyx(balance.locked.toString()),
					total: formatPolyx(balance.total.toString()),
					freeRaw: balance.free.toString(),
					lockedRaw: balance.locked.toString(),
					totalRaw: balance.total.toString(),
				};
				break;
			}

			case 'getMyBalance': {
				const account = await polymesh.accountManagement.getSigningAccount();
				if (!account) {
					throw new NodeOperationError(this.getNode(), 'No signing account available');
				}
				
				const balance = await account.getBalance();
				
				result = {
					address: account.address,
					free: formatPolyx(balance.free.toString()),
					locked: formatPolyx(balance.locked.toString()),
					total: formatPolyx(balance.total.toString()),
					freeRaw: balance.free.toString(),
					lockedRaw: balance.locked.toString(),
					totalRaw: balance.total.toString(),
				};
				break;
			}

			case 'getAccountIdentity': {
				const address = this.getNodeParameter('address', i) as string;
				
				const account = await polymesh.accountManagement.getAccount({ address });
				const identity = await account.getIdentity();
				
				if (!identity) {
					result = {
						address,
						hasIdentity: false,
						did: null,
					};
				} else {
					const hasCdd = await identity.hasValidCdd();
					result = {
						address,
						hasIdentity: true,
						did: identity.did,
						hasCdd,
					};
				}
				break;
			}

			case 'getAccountPermissions': {
				const address = this.getNodeParameter('address', i) as string;
				
				const account = await polymesh.accountManagement.getAccount({ address });
				const identity = await account.getIdentity();
				
				if (!identity) {
					throw new NodeOperationError(this.getNode(), 'Account is not linked to any identity');
				}

				const permissions = await account.getPermissions();
				
				result = {
					address,
					did: identity.did,
					permissions: {
						assets: permissions.assets,
						portfolios: permissions.portfolios,
						transactions: permissions.transactions,
						transactionGroups: permissions.transactionGroups,
					},
				};
				break;
			}

			case 'getSubsidizerInfo': {
				const address = this.getNodeParameter('address', i) as string;
				
				const account = await polymesh.accountManagement.getAccount({ address });
				const subsidizer = await account.getSubsidy();
				
				if (!subsidizer) {
					result = {
						address,
						isSubsidized: false,
						subsidizer: null,
					};
				} else {
					result = {
						address,
						isSubsidized: true,
						subsidizer: {
							address: subsidizer.subsidizer.address,
							allowance: subsidizer.allowance.toString(),
						},
					};
				}
				break;
			}

			case 'transferPolyx': {
				const toAddress = this.getNodeParameter('toAddress', i) as string;
				const amount = this.getNodeParameter('amount', i) as string;
				const memo = this.getNodeParameter('memo', i, '') as string;

				if (!isValidAddress(toAddress)) {
					throw new NodeOperationError(this.getNode(), 'Invalid recipient address format');
				}

				const amountBn = toMicroPolyx(amount);

				const transferParams: any = {
					to: toAddress,
					amount: amountBn,
				};

				if (memo) {
					transferParams.memo = memo;
				}

				const account = await polymesh.accountManagement.getSigningAccount();
				if (!account) {
					throw new NodeOperationError(this.getNode(), 'No signing account available');
				}

				const balance = await account.getBalance();
				if (BigInt(balance.free.toString()) < BigInt(amountBn.toString())) {
					throw new NodeOperationError(this.getNode(), 'Insufficient POLYX balance');
				}

				const tx = await polymesh.network.transferPolyx(transferParams);
				await waitForTransaction(tx);

				result = {
					success: true,
					from: account.address,
					to: toAddress,
					amount: formatPolyx(amount),
					amountRaw: amountBn.toString(),
					memo: memo || null,
				};
				break;
			}

			case 'getTransactionHistory': {
				const address = this.getNodeParameter('address', i) as string;
				const limit = this.getNodeParameter('limit', i, 25) as number;

				const account = await polymesh.accountManagement.getAccount({ address });
				const history = await account.getTransactionHistory({
					size: limit,
				});

				result = {
					address,
					count: history.data.length,
					transactions: history.data.map((tx: any) => ({
						txHash: tx.txHash,
						blockNumber: tx.blockNumber,
						blockHash: tx.blockHash,
						extrinsicIdx: tx.extrinsicIdx,
						address: tx.address,
						nonce: tx.nonce?.toString(),
						module: tx.tag?.split('.')[0],
						call: tx.tag?.split('.')[1],
						params: tx.params,
						success: tx.success,
						specVersionId: tx.specVersionId,
						extrinsicHash: tx.extrinsicHash,
					})),
				};
				break;
			}

			case 'getPendingAuthorizations': {
				const address = this.getNodeParameter('address', i) as string;
				const authType = this.getNodeParameter('authType', i, 'all') as string;

				const account = await polymesh.accountManagement.getAccount({ address });
				const identity = await account.getIdentity();

				if (!identity) {
					throw new NodeOperationError(this.getNode(), 'Account is not linked to any identity');
				}

				const authParams: any = {
					includeExpired: false,
				};

				if (authType !== 'all') {
					authParams.type = authType;
				}

				const authorizations = await identity.authorizations.getReceived(authParams);

				result = {
					address,
					did: identity.did,
					count: authorizations.length,
					authorizations: authorizations.map((auth: any) => ({
						authId: auth.authId.toString(),
						type: auth.data.type,
						issuer: auth.issuer.did,
						target: auth.target,
						expiry: auth.expiry?.toISOString() || null,
						data: auth.data,
					})),
				};
				break;
			}

			case 'acceptAuthorization': {
				const authId = this.getNodeParameter('authId', i) as string;

				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity available');
				}

				const authorizations = await signingIdentity.authorizations.getReceived();
				const auth = authorizations.find((a: any) => a.authId.toString() === authId);

				if (!auth) {
					throw new NodeOperationError(this.getNode(), `Authorization ${authId} not found`);
				}

				const tx = await auth.accept();
				await waitForTransaction(tx);

				result = {
					success: true,
					authId,
					type: auth.data.type,
					issuer: auth.issuer.did,
				};
				break;
			}

			case 'rejectAuthorization': {
				const authId = this.getNodeParameter('authId', i) as string;

				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity available');
				}

				const authorizations = await signingIdentity.authorizations.getReceived();
				const auth = authorizations.find((a: any) => a.authId.toString() === authId);

				if (!auth) {
					throw new NodeOperationError(this.getNode(), `Authorization ${authId} not found`);
				}

				const tx = await auth.remove();
				await waitForTransaction(tx);

				result = {
					success: true,
					authId,
					rejected: true,
				};
				break;
			}

			case 'getMultiSigInfo': {
				const address = this.getNodeParameter('address', i) as string;

				const account = await polymesh.accountManagement.getAccount({ address });
				const multiSig = await account.getMultiSig();

				if (!multiSig) {
					result = {
						address,
						isMultiSig: false,
					};
				} else {
					const signers = await multiSig.getSigners();
					const requiredSignatures = await multiSig.getRequiredSignatures();

					result = {
						address,
						isMultiSig: true,
						multiSigAddress: multiSig.address,
						requiredSignatures: requiredSignatures.toString(),
						signers: signers.map((s: any) => s.address),
					};
				}
				break;
			}

			case 'validateAddress': {
				const address = this.getNodeParameter('address', i) as string;

				const isValid = isValidAddress(address);
				let linkedIdentity = null;

				if (isValid) {
					try {
						const account = await polymesh.accountManagement.getAccount({ address });
						const identity = await account.getIdentity();
						if (identity) {
							linkedIdentity = identity.did;
						}
					} catch {
						// Address valid but account doesn't exist on-chain yet
					}
				}

				result = {
					address,
					isValid,
					linkedIdentity,
					format: isValid ? 'SS58 (prefix 12)' : 'Invalid',
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
