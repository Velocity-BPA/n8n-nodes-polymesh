import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PolymeshNetwork implements ICredentialType {
	name = 'polymeshNetwork';
	displayName = 'Polymesh Network';
	documentationUrl = 'https://developers.polymesh.network/';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Polymesh Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Polymesh Testnet',
					value: 'testnet',
				},
				{
					name: 'Polymesh Staging (ITN)',
					value: 'staging',
				},
				{
					name: 'Local Development',
					value: 'local',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'testnet',
			description: 'The Polymesh network to connect to',
		},
		{
			displayName: 'Custom WebSocket URL',
			name: 'customWsUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://your-node.example.com',
			description: 'Custom WebSocket endpoint for the Polymesh node',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Signing Key Seed Phrase',
			name: 'seedPhrase',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: '12-word mnemonic seed phrase for signing transactions. Never share this with anyone.',
			required: true,
		},
		{
			displayName: 'Key Type',
			name: 'keyType',
			type: 'options',
			options: [
				{
					name: 'SR25519 (Recommended)',
					value: 'sr25519',
				},
				{
					name: 'ED25519',
					value: 'ed25519',
				},
			],
			default: 'sr25519',
			description: 'Cryptographic key type for signing',
		},
		{
			displayName: 'Account Derivation Path',
			name: 'derivationPath',
			type: 'string',
			default: '',
			placeholder: '//0',
			description: 'Optional derivation path for HD wallets (e.g., //0, //1)',
		},
		{
			displayName: 'Secondary Key Seed (Optional)',
			name: 'secondaryKeySeed',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional secondary key seed phrase for additional signing capabilities',
		},
		{
			displayName: 'Middleware API URL (Optional)',
			name: 'middlewareUrl',
			type: 'string',
			default: '',
			placeholder: 'https://mainnet-graphql.polymesh.network/graphql',
			description: 'Polymesh Subquery middleware GraphQL endpoint for enhanced queries',
		},
		{
			displayName: 'Middleware API Key (Optional)',
			name: 'middlewareApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for authenticated middleware access',
		},
	];

	// Network endpoint mapping
	static getNetworkEndpoint(network: string, customUrl?: string): string {
		const endpoints: Record<string, string> = {
			mainnet: 'wss://mainnet-rpc.polymesh.network',
			testnet: 'wss://testnet-rpc.polymesh.live',
			staging: 'wss://staging-rpc.polymesh.dev',
			local: 'ws://127.0.0.1:9944',
		};

		if (network === 'custom' && customUrl) {
			return customUrl;
		}

		return endpoints[network] || endpoints.testnet;
	}

	// Middleware endpoint mapping
	static getMiddlewareEndpoint(network: string): string {
		const endpoints: Record<string, string> = {
			mainnet: 'https://mainnet-graphql.polymesh.network/graphql',
			testnet: 'https://testnet-graphql.polymesh.live/graphql',
			staging: 'https://staging-graphql.polymesh.dev/graphql',
			local: 'http://localhost:3000/graphql',
		};

		return endpoints[network] || endpoints.testnet;
	}
}
