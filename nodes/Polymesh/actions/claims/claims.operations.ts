import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getPolymeshClient, formatPolymeshError, waitForTransaction } from '../../transport/polymeshClient';
import { filterClaimsByType, getCddClaims, getAccreditedClaims, getJurisdictionClaims, isClaimExpired } from '../../utils/claimsUtils';

export async function executeClaimsOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	const polymesh = await getPolymeshClient.call(this);
	let result: any;

	try {
		switch (operation) {
			case 'getClaims': {
				const did = this.getNodeParameter('did', i) as string;
				const claimType = this.getNodeParameter('claimType', i, 'all') as string;
				const includeExpired = this.getNodeParameter('includeExpired', i, false) as boolean;

				const identity = await polymesh.identities.getIdentity({ did });
				const claims = await identity.getClaims();

				let filtered = claims;
				if (claimType !== 'all') {
					filtered = filterClaimsByType(claims, claimType);
				}
				if (!includeExpired) {
					filtered = filtered.filter((c: any) => !isClaimExpired(c));
				}

				result = {
					did,
					count: filtered.length,
					claims: filtered.map((c: any) => ({
						type: c.claim?.type,
						scope: c.claim?.scope,
						issuer: c.issuer?.did,
						issuedAt: c.issuedAt?.toISOString(),
						expiry: c.expiry?.toISOString(),
					})),
				};
				break;
			}

			case 'getCddClaims': {
				const did = this.getNodeParameter('did', i) as string;

				const identity = await polymesh.identities.getIdentity({ did });
				const claims = await identity.getClaims();
				const cddClaims = getCddClaims(claims);

				result = {
					did,
					hasCdd: cddClaims.length > 0,
					claims: cddClaims.map((c: any) => ({
						issuer: c.issuer?.did,
						issuedAt: c.issuedAt?.toISOString(),
						expiry: c.expiry?.toISOString(),
						isExpired: isClaimExpired(c),
					})),
				};
				break;
			}

			case 'getAccreditedClaims': {
				const did = this.getNodeParameter('did', i) as string;

				const identity = await polymesh.identities.getIdentity({ did });
				const claims = await identity.getClaims();
				const accredited = getAccreditedClaims(claims);

				result = {
					did,
					isAccredited: accredited.length > 0,
					claims: accredited.map((c: any) => ({
						scope: c.claim?.scope,
						issuer: c.issuer?.did,
						expiry: c.expiry?.toISOString(),
					})),
				};
				break;
			}

			case 'getJurisdictionClaims': {
				const did = this.getNodeParameter('did', i) as string;

				const identity = await polymesh.identities.getIdentity({ did });
				const claims = await identity.getClaims();
				const jurisdictions = getJurisdictionClaims(claims);

				result = {
					did,
					jurisdictions: jurisdictions.map((c: any) => ({
						jurisdiction: c.claim?.jurisdiction,
						scope: c.claim?.scope,
						issuer: c.issuer?.did,
					})),
				};
				break;
			}

			case 'addClaim': {
				const targetDid = this.getNodeParameter('targetDid', i) as string;
				const claimType = this.getNodeParameter('claimType', i) as string;
				const scopeType = this.getNodeParameter('scopeType', i, 'Identity') as string;
				const scopeValue = this.getNodeParameter('scopeValue', i, '') as string;
				const expiryDays = this.getNodeParameter('expiryDays', i, 0) as number;

				const claimData: any = { type: claimType };

				if (scopeType && scopeValue) {
					claimData.scope = { type: scopeType, value: scopeValue };
				}

				const addParams: any = {
					claims: [{
						target: targetDid,
						claim: claimData,
					}],
				};

				if (expiryDays > 0) {
					addParams.claims[0].expiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
				}

				const tx = await polymesh.claims.addClaims(addParams);
				await waitForTransaction(tx);

				result = {
					success: true,
					target: targetDid,
					claimType,
					scope: scopeValue || null,
				};
				break;
			}

			case 'revokeClaim': {
				const targetDid = this.getNodeParameter('targetDid', i) as string;
				const claimType = this.getNodeParameter('claimType', i) as string;
				const scopeType = this.getNodeParameter('scopeType', i, '') as string;
				const scopeValue = this.getNodeParameter('scopeValue', i, '') as string;

				const claimData: any = { type: claimType };
				if (scopeType && scopeValue) {
					claimData.scope = { type: scopeType, value: scopeValue };
				}

				const tx = await polymesh.claims.revokeClaims({
					claims: [{ target: targetDid, claim: claimData }],
				});
				await waitForTransaction(tx);

				result = { success: true, target: targetDid, revoked: claimType };
				break;
			}

			case 'getClaimsByIssuer': {
				const issuerDid = this.getNodeParameter('issuerDid', i) as string;
				const limit = this.getNodeParameter('limit', i, 50) as number;

				const identity = await polymesh.identities.getIdentity({ did: issuerDid });
				const issuedClaims = await identity.getIssuedClaims({ size: limit });

				result = {
					issuer: issuerDid,
					count: issuedClaims.data.length,
					claims: issuedClaims.data.map((c: any) => ({
						target: c.target?.did,
						type: c.claim?.type,
						scope: c.claim?.scope,
						expiry: c.expiry?.toISOString(),
					})),
				};
				break;
			}

			case 'getClaimScopes': {
				const did = this.getNodeParameter('did', i) as string;

				const identity = await polymesh.identities.getIdentity({ did });
				const scopes = await identity.getClaimScopes();

				result = {
					did,
					scopes: scopes.map((s: any) => ({
						scope: s.scope,
						ticker: s.ticker,
					})),
				};
				break;
			}

			case 'getMyClaims': {
				const claimType = this.getNodeParameter('claimType', i, 'all') as string;

				const signingIdentity = await polymesh.getSigningIdentity();
				if (!signingIdentity) {
					throw new NodeOperationError(this.getNode(), 'No signing identity');
				}

				const claims = await signingIdentity.getClaims();
				let filtered = claims;
				if (claimType !== 'all') {
					filtered = filterClaimsByType(claims, claimType);
				}

				result = {
					did: signingIdentity.did,
					count: filtered.length,
					claims: filtered.map((c: any) => ({
						type: c.claim?.type,
						issuer: c.issuer?.did,
						expiry: c.expiry?.toISOString(),
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
