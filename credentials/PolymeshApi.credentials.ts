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
			default: 'https://mainnet-api.polymesh.network/api/v1',
			required: true,
		},
		{
			displayName: 'Authentication Method',
			name: 'authMethod',
			type: 'options',
			options: [
				{
					name: 'Wallet Signature',
					value: 'signature',
				},
				{
					name: 'API Key',
					value: 'apiKey',
				},
			],
			default: 'signature',
		},
		{
			displayName: 'Polymesh DID',
			name: 'did',
			type: 'string',
			placeholder: '0x...',
			description: 'Your Polymesh Decentralized Identity (DID)',
			required: true,
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					authMethod: [
						'signature',
					],
				},
			},
			description: 'Private key for signing transactions',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					authMethod: [
						'apiKey',
					],
				},
			},
			description: 'API key for authenticated requests',
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
		},
	];
}