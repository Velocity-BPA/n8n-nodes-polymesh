import type { INodeProperties } from 'n8n-workflow';

export const multiSigOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['multiSig'] } },
		options: [
			{ name: 'Approve Proposal', value: 'approveProposal', description: 'Approve a multi-sig proposal', action: 'Approve proposal' },
			{ name: 'Create Multi-Sig', value: 'createMultiSig', description: 'Create a multi-sig account', action: 'Create multi sig' },
			{ name: 'Get Multi-Sig Account', value: 'getMultiSigAccount', description: 'Get multi-sig account details', action: 'Get multi sig account' },
			{ name: 'Get Multi-Sig Proposals', value: 'getMultiSigProposals', description: 'Get pending proposals', action: 'Get multi sig proposals' },
			{ name: 'Get Multi-Sig Signers', value: 'getMultiSigSigners', description: 'Get signers of multi-sig', action: 'Get multi sig signers' },
			{ name: 'Get Required Signatures', value: 'getRequiredSignatures', description: 'Get required signature count', action: 'Get required signatures' },
			{ name: 'Modify Signers', value: 'modifySigners', description: 'Add or remove signers', action: 'Modify signers' },
			{ name: 'Reject Proposal', value: 'rejectProposal', description: 'Reject a multi-sig proposal', action: 'Reject proposal' },
		],
		default: 'getMultiSigAccount',
	},
];

export const multiSigFields: INodeProperties[] = [
	{
		displayName: 'Multi-Sig Address',
		name: 'address',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['multiSig'], operation: ['getMultiSigAccount', 'getMultiSigProposals', 'approveProposal', 'rejectProposal', 'getMultiSigSigners', 'getRequiredSignatures', 'modifySigners'] } },
		default: '',
		description: 'The multi-sig account address',
	},
	{
		displayName: 'Signers',
		name: 'signers',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['multiSig'], operation: ['createMultiSig'] } },
		default: '',
		description: 'Comma-separated list of signer addresses',
	},
	{
		displayName: 'Required Signatures',
		name: 'requiredSignatures',
		type: 'number',
		required: true,
		displayOptions: { show: { resource: ['multiSig'], operation: ['createMultiSig'] } },
		default: 2,
		description: 'Number of signatures required to execute',
	},
	{
		displayName: 'Proposal ID',
		name: 'proposalId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['multiSig'], operation: ['approveProposal', 'rejectProposal'] } },
		default: '',
		description: 'The proposal ID to approve/reject',
	},
	{
		displayName: 'Signer Action',
		name: 'signerAction',
		type: 'options',
		displayOptions: { show: { resource: ['multiSig'], operation: ['modifySigners'] } },
		options: [
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
		],
		default: 'add',
		description: 'Whether to add or remove the signer',
	},
	{
		displayName: 'Signer Address',
		name: 'signerAddress',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['multiSig'], operation: ['modifySigners'] } },
		default: '',
		description: 'Address of the signer to add/remove',
	},
];
