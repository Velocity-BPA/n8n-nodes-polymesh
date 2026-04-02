import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PolymeshApi implements ICredentialType {
	name = 'polymeshApi';
	displayName = 'Polymesh API';
	documentationUrl = 'https://docs.polymesh.network/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mainnet-api.polymesh.network',
			required: true,
			description: 'The base URL for the Polymesh API',
		},
		{
			displayName: 'Wallet Address',
			name: 'walletAddress',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Polymesh wallet address for signing transactions',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your private key for signing transactions (keep secure)',
		},
		{
			displayName: 'Network',
			name: 'network',
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
			],
			default: 'mainnet',
			required: true,
			description: 'The Polymesh network to connect to',
		},
	];
}