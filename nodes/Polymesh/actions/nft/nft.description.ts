import type { INodeProperties } from 'n8n-workflow';

export const nftOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['nft'] } },
		options: [
			{ name: 'Create NFT Collection', value: 'createNftCollection', description: 'Create a new NFT collection', action: 'Create NFT collection' },
			{ name: 'Get Collection Asset', value: 'getCollectionAsset', description: 'Get underlying asset details', action: 'Get collection asset' },
			{ name: 'Get NFT Collection', value: 'getNftCollection', description: 'Get NFT collection details', action: 'Get NFT collection' },
			{ name: 'Get NFT Details', value: 'getNftDetails', description: 'Get individual NFT details', action: 'Get NFT details' },
			{ name: 'Get NFT Metadata', value: 'getNftMetadata', description: 'Get NFT metadata', action: 'Get NFT metadata' },
			{ name: 'Get NFTs by Owner', value: 'getNftsByOwner', description: 'Get NFTs owned by identity', action: 'Get NFTs by owner' },
			{ name: 'Issue NFT', value: 'issueNft', description: 'Issue a new NFT', action: 'Issue NFT' },
			{ name: 'Redeem NFT', value: 'redeemNft', description: 'Redeem (burn) an NFT', action: 'Redeem NFT' },
		],
		default: 'getNftCollection',
	},
];

export const nftFields: INodeProperties[] = [
	{
		displayName: 'Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['nft'] } },
		default: '',
		description: 'The NFT collection ticker',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['nft'], operation: ['createNftCollection'] } },
		default: '',
		description: 'Name of the NFT collection',
	},
	{
		displayName: 'NFT Type',
		name: 'nftType',
		type: 'options',
		required: true,
		displayOptions: { show: { resource: ['nft'], operation: ['createNftCollection'] } },
		options: [
			{ name: 'Derivative', value: 'Derivative' },
			{ name: 'Fixed Income', value: 'FixedIncome' },
			{ name: 'Invoice', value: 'Invoice' },
			{ name: 'Custom', value: 'Custom' },
		],
		default: 'Custom',
		description: 'Type of NFT',
	},
	{
		displayName: 'Collection Keys',
		name: 'collectionKeys',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { resource: ['nft'], operation: ['createNftCollection'] } },
		default: {},
		options: [
			{
				name: 'keyValues',
				displayName: 'Key',
				values: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Local', value: 'Local' },
							{ name: 'Global', value: 'Global' },
						],
						default: 'Local',
					},
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
				],
			},
		],
		description: 'Metadata keys for the collection',
	},
	{
		displayName: 'NFT ID',
		name: 'nftId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['nft'], operation: ['getNftDetails', 'redeemNft', 'getNftMetadata'] } },
		default: '',
		description: 'The ID of the NFT',
	},
	{
		displayName: 'Metadata',
		name: 'metadata',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		displayOptions: { show: { resource: ['nft'], operation: ['issueNft'] } },
		default: {},
		options: [
			{
				name: 'metadataValues',
				displayName: 'Metadata',
				values: [
					{ displayName: 'Key', name: 'key', type: 'string', default: '' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '' },
				],
			},
		],
		description: 'Metadata for the NFT',
	},
	{
		displayName: 'Portfolio ID',
		name: 'portfolioId',
		type: 'string',
		displayOptions: { show: { resource: ['nft'], operation: ['issueNft', 'redeemNft'] } },
		default: '0',
		description: 'Portfolio ID (0 for default)',
	},
	{
		displayName: 'Identity DID',
		name: 'did',
		type: 'string',
		displayOptions: { show: { resource: ['nft'], operation: ['getNftsByOwner'] } },
		default: '',
		description: 'DID of the owner (leave empty for signing identity)',
	},
];
