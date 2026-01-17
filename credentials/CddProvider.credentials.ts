import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CddProvider implements ICredentialType {
	name = 'cddProvider';
	displayName = 'Polymesh CDD Provider';
	documentationUrl = 'https://developers.polymesh.network/cdd';
	properties: INodeProperties[] = [
		{
			displayName: 'Provider Type',
			name: 'providerType',
			type: 'options',
			options: [
				{
					name: 'Polymath CDD',
					value: 'polymath',
				},
				{
					name: 'Fractal ID',
					value: 'fractal',
				},
				{
					name: 'Netki',
					value: 'netki',
				},
				{
					name: 'Custom Provider',
					value: 'custom',
				},
			],
			default: 'polymath',
			description: 'The CDD (Customer Due Diligence) provider to use',
		},
		{
			displayName: 'Provider DID',
			name: 'providerDid',
			type: 'string',
			default: '',
			placeholder: '0x...',
			description: 'The DID (Decentralized Identifier) of the CDD provider',
			required: true,
		},
		{
			displayName: 'API Endpoint',
			name: 'apiEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://cdd-provider.example.com/api',
			description: 'The API endpoint for the CDD provider',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for authentication with the CDD provider',
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API secret for authentication with the CDD provider',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			description: 'OAuth client ID (if using OAuth authentication)',
		},
		{
			displayName: 'Webhook URL',
			name: 'webhookUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-app.example.com/webhook/cdd',
			description: 'Webhook URL for receiving CDD verification callbacks',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
			],
			default: 'sandbox',
			description: 'CDD provider environment',
		},
	];
}
