import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PolymeshMiddleware implements ICredentialType {
	name = 'polymeshMiddleware';
	displayName = 'Polymesh Middleware API';
	documentationUrl = 'https://developers.polymesh.network/middleware';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet',
					value: 'testnet',
				},
				{
					name: 'Staging',
					value: 'staging',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'testnet',
			description: 'The Polymesh middleware environment',
		},
		{
			displayName: 'GraphQL Endpoint',
			name: 'graphqlEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://your-middleware.example.com/graphql',
			description: 'Custom GraphQL endpoint URL',
			displayOptions: {
				show: {
					environment: ['custom'],
				},
			},
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for authenticated middleware access (if required)',
		},
		{
			displayName: 'Request Timeout (ms)',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Request timeout in milliseconds',
		},
	];

	// Get the endpoint based on environment
	static getEndpoint(environment: string, customEndpoint?: string): string {
		const endpoints: Record<string, string> = {
			mainnet: 'https://mainnet-graphql.polymesh.network/graphql',
			testnet: 'https://testnet-graphql.polymesh.live/graphql',
			staging: 'https://staging-graphql.polymesh.dev/graphql',
		};

		if (environment === 'custom' && customEndpoint) {
			return customEndpoint;
		}

		return endpoints[environment] || endpoints.testnet;
	}
}
