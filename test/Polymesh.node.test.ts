/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Polymesh } from '../nodes/Polymesh/Polymesh.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Polymesh Node', () => {
  let node: Polymesh;

  beforeAll(() => {
    node = new Polymesh();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Polymesh');
      expect(node.description.name).toBe('polymesh');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Asset Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://mainnet-api.polymesh.network' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get asset details successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAsset')
      .mockReturnValueOnce('TICKER');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      ticker: 'TICKER',
      name: 'Test Asset',
      totalSupply: '1000000',
    });

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result[0].json.ticker).toBe('TICKER');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.polymesh.network/assets/TICKER',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  it('should handle get asset error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAsset')
      .mockReturnValueOnce('INVALID');
    
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Asset not found'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result[0].json.error).toBe('Asset not found');
  });

  it('should create asset successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createAsset')
      .mockReturnValueOnce('Test Token')
      .mockReturnValueOnce('TEST')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce('SecurityToken');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      txHash: '0x123456',
      ticker: 'TEST',
      status: 'pending',
    });

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result[0].json.ticker).toBe('TEST');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://mainnet-api.polymesh.network/assets/create',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      body: {
        name: 'Test Token',
        ticker: 'TEST',
        divisible: true,
        assetType: 'SecurityToken',
      },
      json: true,
    });
  });

  it('should freeze asset successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('freezeAsset')
      .mockReturnValueOnce('TICKER');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      txHash: '0x789012',
      status: 'frozen',
    });

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result[0].json.status).toBe('frozen');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://mainnet-api.polymesh.network/assets/TICKER/freeze',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });
});

describe('Identity Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://mainnet-api.polymesh.network' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getIdentity operation', () => {
    it('should retrieve identity details successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getIdentity');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('0x1234567890');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        did: '0x1234567890',
        primaryKey: '0xabcdef',
        hasValidCdd: true 
      });

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result).toHaveLength(1);
      expect(result[0].json.did).toBe('0x1234567890');
    });

    it('should handle getIdentity error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getIdentity');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('invalid-did');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Identity not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Identity not found');
    });
  });

  describe('getAllIdentities operation', () => {
    it('should retrieve all identities successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllIdentities');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(100);
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(0);
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(false);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        identities: [{ did: '0x1234567890' }, { did: '0x0987654321' }],
        total: 2 
      });

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result).toHaveLength(1);
      expect(result[0].json.identities).toHaveLength(2);
    });
  });

  describe('createIdentity operation', () => {
    it('should create identity successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createIdentity');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('0xabcdef1234567890');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('2024-12-31T23:59:59Z');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        did: '0x1234567890',
        status: 'pending' 
      });

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result).toHaveLength(1);
      expect(result[0].json.did).toBe('0x1234567890');
      expect(result[0].json.status).toBe('pending');
    });
  });

  describe('updateIdentityCdd operation', () => {
    it('should update identity CDD successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('updateIdentityCdd');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('0x1234567890');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('2025-12-31T23:59:59Z');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        success: true,
        transactionHash: '0xabc123' 
      });

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result).toHaveLength(1);
      expect(result[0].json.success).toBe(true);
    });
  });

  describe('revokeIdentityCdd operation', () => {
    it('should revoke identity CDD successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('revokeIdentityCdd');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('0x1234567890');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        success: true,
        transactionHash: '0xdef456' 
      });

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result).toHaveLength(1);
      expect(result[0].json.success).toBe(true);
    });
  });

  describe('getIdentityPortfolios operation', () => {
    it('should retrieve identity portfolios successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getIdentityPortfolios');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('0x1234567890');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        portfolios: [
          { id: 'portfolio1', name: 'Default' },
          { id: 'portfolio2', name: 'Trading' }
        ] 
      });

      const result = await executeIdentityOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result).toHaveLength(1);
      expect(result[0].json.portfolios).toHaveLength(2);
    });
  });
});

describe('Portfolio Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://mainnet-api.polymesh.network' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  it('should get portfolio successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getPortfolio')
      .mockReturnValueOnce('did123')
      .mockReturnValueOnce('portfolio456');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      id: 'portfolio456', 
      name: 'Test Portfolio' 
    });

    const result = await executePortfolioOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('id', 'portfolio456');
  });

  it('should handle get portfolio error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getPortfolio')
      .mockReturnValueOnce('did123')
      .mockReturnValueOnce('portfolio456');
    
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executePortfolioOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('error', 'API Error');
  });

  it('should create portfolio successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createPortfolio')
      .mockReturnValueOnce('New Portfolio')
      .mockReturnValueOnce('did123');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      id: 'new-portfolio-id', 
      name: 'New Portfolio' 
    });

    const result = await executePortfolioOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('name', 'New Portfolio');
  });

  it('should get portfolio balances successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getPortfolioBalances')
      .mockReturnValueOnce('did123')
      .mockReturnValueOnce('portfolio456');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      balances: [{ asset: 'POLYX', amount: '1000' }] 
    });

    const result = await executePortfolioOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('balances');
  });
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://mainnet-api.polymesh.network'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	it('should create settlement successfully', async () => {
		const mockResponse = { id: 'settlement-123', status: 'Pending' };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createSettlement')
			.mockReturnValueOnce([{ from: 'portfolio1', to: 'portfolio2', asset: 'TICKER', amount: '1000' }])
			.mockReturnValueOnce('venue-123')
			.mockReturnValueOnce('SettleOnAffirmation');

		const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://mainnet-api.polymesh.network/settlements/create',
			headers: {
				'Authorization': 'Bearer test-key',
				'Content-Type': 'application/json',
			},
			json: true,
			body: {
				legs: [{ from: 'portfolio1', to: 'portfolio2', asset: 'TICKER', amount: '1000' }],
				venueId: 'venue-123',
				type: 'SettleOnAffirmation',
			},
		});
	});

	it('should get settlement successfully', async () => {
		const mockResponse = { id: 'settlement-123', status: 'Pending', legs: [] };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getSettlement')
			.mockReturnValueOnce('settlement-123');

		const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://mainnet-api.polymesh.network/settlements/settlement-123',
			headers: {
				'Authorization': 'Bearer test-key',
			},
			json: true,
		});
	});

	it('should handle API errors gracefully', async () => {
		const mockError = new Error('API Error');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSettlement');

		await expect(
			executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('API Error');
	});

	it('should continue on fail when configured', async () => {
		const mockError = new Error('API Error');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSettlement');

		const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{
			json: { error: 'API Error' },
			pairedItem: { item: 0 }
		}]);
	});
});

describe('Compliance Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://mainnet-api.polymesh.network',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getComplianceRequirements', () => {
		it('should get compliance requirements successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getComplianceRequirements')
				.mockReturnValueOnce('MYTOKEN');

			const mockResponse = {
				requirements: [
					{ id: '1', senderConditions: {}, receiverConditions: {} },
				],
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeComplianceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle errors when getting compliance requirements', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getComplianceRequirements')
				.mockReturnValueOnce('MYTOKEN');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeComplianceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: { error: 'API Error' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('createComplianceRequirement', () => {
		it('should create compliance requirement successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createComplianceRequirement')
				.mockReturnValueOnce('MYTOKEN')
				.mockReturnValueOnce('{"type": "sender"}')
				.mockReturnValueOnce('{"type": "receiver"}');

			const mockResponse = { id: '123', status: 'created' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeComplianceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('updateComplianceRequirement', () => {
		it('should update compliance requirement successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateComplianceRequirement')
				.mockReturnValueOnce('MYTOKEN')
				.mockReturnValueOnce('123')
				.mockReturnValueOnce('{"type": "updated_sender"}')
				.mockReturnValueOnce('{"type": "updated_receiver"}');

			const mockResponse = { id: '123', status: 'updated' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeComplianceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('deleteComplianceRequirement', () => {
		it('should delete compliance requirement successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('deleteComplianceRequirement')
				.mockReturnValueOnce('MYTOKEN')
				.mockReturnValueOnce('123');

			const mockResponse = { status: 'deleted' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeComplianceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('pauseCompliance', () => {
		it('should pause compliance successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('pauseCompliance')
				.mockReturnValueOnce('MYTOKEN');

			const mockResponse = { status: 'paused' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeComplianceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('resumeCompliance', () => {
		it('should resume compliance successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('resumeCompliance')
				.mockReturnValueOnce('MYTOKEN');

			const mockResponse = { status: 'resumed' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeComplianceOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});
});

describe('Venue Resource', () => {
  let mockExecuteFunctions: any;
  
  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://mainnet-api.polymesh.network' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });
  
  test('should get venue successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getVenue')
      .mockReturnValueOnce('123');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: '123',
      details: 'Test Venue',
      type: 'Exchange'
    });
    
    const result = await executeVenueOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.id).toBe('123');
  });
  
  test('should handle get venue error', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getVenue')
      .mockReturnValueOnce('123');
    
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    
    const result = await executeVenueOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
  
  test('should get all venues successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAllVenues')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(0);
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      venues: [{ id: '1' }, { id: '2' }],
      total: 2
    });
    
    const result = await executeVenueOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.venues).toHaveLength(2);
  });
  
  test('should create venue successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createVenue')
      .mockReturnValueOnce('New Venue')
      .mockReturnValueOnce('Exchange');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: '456',
      details: 'New Venue',
      type: 'Exchange'
    });
    
    const result = await executeVenueOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.id).toBe('456');
  });
  
  test('should update venue successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('updateVenue')
      .mockReturnValueOnce('123')
      .mockReturnValueOnce('Updated Venue');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: '123',
      details: 'Updated Venue'
    });
    
    const result = await executeVenueOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.details).toBe('Updated Venue');
  });
  
  test('should get venue instructions successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getVenueInstructions')
      .mockReturnValueOnce('123')
      .mockReturnValueOnce('Pending');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      instructions: [{ id: '1', status: 'Pending' }]
    });
    
    const result = await executeVenueOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.instructions).toHaveLength(1);
  });
  
  test('should allow instruction types successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('allowInstructionTypes')
      .mockReturnValueOnce('123')
      .mockReturnValueOnce('SettleOnAffirmation,SettleOnBlock');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      success: true,
      allowedTypes: ['SettleOnAffirmation', 'SettleOnBlock']
    });
    
    const result = await executeVenueOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.success).toBe(true);
  });
});
});
