/**
 * CDD Provider Client
 * 
 * Handles integration with Customer Due Diligence (KYC) providers
 * for identity verification on Polymesh.
 */

import axios, { AxiosInstance } from 'axios';
import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';

// CDD verification status
export enum CddVerificationStatus {
	Pending = 'pending',
	InProgress = 'in_progress',
	Approved = 'approved',
	Rejected = 'rejected',
	Expired = 'expired',
}

// CDD verification request
export interface CddVerificationRequest {
	address: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	dateOfBirth?: string;
	nationality?: string;
	residenceCountry?: string;
	documentType?: string;
	documentNumber?: string;
	callbackUrl?: string;
}

// CDD verification response
export interface CddVerificationResponse {
	verificationId: string;
	status: CddVerificationStatus;
	did?: string;
	cddId?: string;
	message?: string;
	redirectUrl?: string;
	expiresAt?: string;
}

// CDD status check response
export interface CddStatusResponse {
	verificationId: string;
	status: CddVerificationStatus;
	did?: string;
	cddId?: string;
	claimExpiry?: string;
	rejectionReason?: string;
	completedAt?: string;
}

// CDD Provider client options
export interface CddProviderOptions {
	providerType: string;
	providerDid: string;
	apiEndpoint: string;
	apiKey?: string;
	apiSecret?: string;
	clientId?: string;
	environment: 'production' | 'sandbox';
}

/**
 * CDD Provider Client class
 */
export class CddProviderClient {
	private client: AxiosInstance;
	private options: CddProviderOptions;
	
	constructor(options: CddProviderOptions) {
		this.options = options;
		
		// Create axios instance
		this.client = axios.create({
			baseURL: options.apiEndpoint,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
				...(options.apiKey && { 'X-API-Key': options.apiKey }),
				...(options.clientId && { 'X-Client-ID': options.clientId }),
			},
		});
		
		// Add auth interceptor if secret is provided
		if (options.apiSecret) {
			this.client.interceptors.request.use((config) => {
				// Generate HMAC signature for request
				const timestamp = Date.now().toString();
				config.headers['X-Timestamp'] = timestamp;
				// Note: In production, implement proper HMAC signing
				return config;
			});
		}
	}
	
	/**
	 * Initiate a CDD verification request
	 */
	async initiateVerification(
		request: CddVerificationRequest,
	): Promise<CddVerificationResponse> {
		try {
			const response = await this.client.post<CddVerificationResponse>(
				'/verification/initiate',
				{
					...request,
					providerDid: this.options.providerDid,
					environment: this.options.environment,
				},
			);
			
			return response.data;
		} catch (error) {
			throw this.formatError(error);
		}
	}
	
	/**
	 * Check the status of a verification request
	 */
	async checkStatus(verificationId: string): Promise<CddStatusResponse> {
		try {
			const response = await this.client.get<CddStatusResponse>(
				`/verification/status/${verificationId}`,
			);
			
			return response.data;
		} catch (error) {
			throw this.formatError(error);
		}
	}
	
	/**
	 * Get verification URL for user to complete KYC
	 */
	async getVerificationUrl(verificationId: string): Promise<string> {
		try {
			const response = await this.client.get<{ url: string }>(
				`/verification/url/${verificationId}`,
			);
			
			return response.data.url;
		} catch (error) {
			throw this.formatError(error);
		}
	}
	
	/**
	 * Refresh an existing CDD claim (before expiry)
	 */
	async refreshCdd(did: string): Promise<CddVerificationResponse> {
		try {
			const response = await this.client.post<CddVerificationResponse>(
				'/verification/refresh',
				{
					did,
					providerDid: this.options.providerDid,
				},
			);
			
			return response.data;
		} catch (error) {
			throw this.formatError(error);
		}
	}
	
	/**
	 * Get CDD claim details for a DID
	 */
	async getCddClaim(did: string): Promise<CddStatusResponse | null> {
		try {
			const response = await this.client.get<CddStatusResponse>(
				`/claims/cdd/${did}`,
			);
			
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return null;
			}
			throw this.formatError(error);
		}
	}
	
	/**
	 * Format API errors
	 */
	private formatError(error: unknown): Error {
		if (axios.isAxiosError(error)) {
			const message = error.response?.data?.message || error.message;
			return new Error(`CDD Provider Error: ${message}`);
		}
		return error instanceof Error ? error : new Error(String(error));
	}
}

/**
 * Get CDD provider credentials from n8n context
 */
export async function getCddProviderCredentials(
	context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<CddProviderOptions | null> {
	try {
		const credentials = await context.getCredentials('cddProvider');
		
		return {
			providerType: credentials.providerType as string,
			providerDid: credentials.providerDid as string,
			apiEndpoint: credentials.apiEndpoint as string,
			apiKey: credentials.apiKey as string | undefined,
			apiSecret: credentials.apiSecret as string | undefined,
			clientId: credentials.clientId as string | undefined,
			environment: credentials.environment as 'production' | 'sandbox',
		};
	} catch {
		return null;
	}
}

/**
 * Create a CDD provider client from n8n context
 */
export async function getCddProviderClient(
	context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<CddProviderClient | null> {
	const credentials = await getCddProviderCredentials(context);
	if (!credentials) {
		return null;
	}
	return new CddProviderClient(credentials);
}
