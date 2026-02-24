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

    it('should define 8 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(8);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(8);
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
describe('Identities Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.polymesh.network/api/v1',
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

  describe('getIdentity', () => {
    it('should retrieve identity details successfully', async () => {
      const mockResponse = {
        did: '0x01000000000000000000000000000000000000000000000000000000000000',
        primaryKey: '5GRwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        secondaryKeys: [],
        assetPermissions: {},
        portfolioPermissions: {}
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getIdentity';
        if (param === 'did') return '0x01000000000000000000000000000000000000000000000000000000000000';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentitiesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/identities/0x01000000000000000000000000000000000000000000000000000000000000',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getIdentity error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getIdentity';
        if (param === 'did') return 'invalid-did';
        return null;
      });

      const error = new Error('Identity not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(executeIdentitiesOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Identity not found');
    });
  });

  describe('listIdentities', () => {
    it('should list identities with pagination successfully', async () => {
      const mockResponse = {
        results: [
          { did: '0x01000000000000000000000000000000000000000000000000000000000000' },
          { did: '0x02000000000000000000000000000000000000000000000000000000000000' }
        ],
        next: 'next-token',
        count: 2
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'listIdentities';
        if (param === 'size') return 10;
        if (param === 'start') return '';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentitiesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getIdentityPortfolios', () => {
    it('should retrieve identity portfolios successfully', async () => {
      const mockResponse = {
        results: [
          {
            id: { did: '0x01000000000000000000000000000000000000000000000000000000000000', kind: 'Default' },
            assetBalances: []
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getIdentityPortfolios';
        if (param === 'did') return '0x01000000000000000000000000000000000000000000000000000000000000';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentitiesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getIdentityClaims', () => {
    it('should retrieve identity claims successfully', async () => {
      const mockResponse = {
        results: [
          {
            target: '0x01000000000000000000000000000000000000000000000000000000000000',
            issuer: '0x02000000000000000000000000000000000000000000000000000000000000',
            claim: { type: 'CustomerDueDiligence', id: 'some-claim-id' }
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getIdentityClaims';
        if (param === 'did') return '0x01000000000000000000000000000000000000000000000000000000000000';
        if (param === 'claimTypes') return 'CustomerDueDiligence';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentitiesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getIdentityInstructions', () => {
    it('should retrieve identity instructions successfully', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            status: 'Pending',
            createdAt: { blockId: 1000, blockHash: '0xabc', datetime: '2023-01-01T00:00:00Z' },
            legs: []
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getIdentityInstructions';
        if (param === 'did') return '0x01000000000000000000000000000000000000000000000000000000000000';
        if (param === 'status') return 'pending';
        return null;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeIdentitiesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });
});

describe('Assets Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.polymesh.network/api/v1',
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

  test('should get asset details successfully', async () => {
    const mockAssetData = {
      ticker: 'TEST',
      name: 'Test Asset',
      totalSupply: '1000000',
      isDivisible: true,
      assetType: 'EquityCommon',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getAsset';
      if (paramName === 'ticker') return 'TEST';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAssetData);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockAssetData);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.polymesh.network/api/v1/assets/TEST',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': 'test-api-key',
      },
      json: true,
    });
  });

  test('should list assets with filtering', async () => {
    const mockAssetsData = {
      results: [
        { ticker: 'ASSET1', name: 'Asset 1' },
        { ticker: 'ASSET2', name: 'Asset 2' },
      ],
      next: null,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'listAssets';
      if (paramName === 'size') return 25;
      if (paramName === 'start') return '';
      if (paramName === 'owner') return '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAssetsData);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockAssetsData);
  });

  test('should get asset holders', async () => {
    const mockHoldersData = {
      results: [
        { identity: '0x123', balance: '1000' },
        { identity: '0x456', balance: '2000' },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getAssetHolders';
      if (paramName === 'ticker') return 'TEST';
      if (paramName === 'size') return 25;
      if (paramName === 'start') return '';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockHoldersData);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockHoldersData);
  });

  test('should get asset transactions', async () => {
    const mockTransactionsData = {
      results: [
        { id: '1', type: 'transfer', amount: '100' },
        { id: '2', type: 'mint', amount: '500' },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getAssetTransactions';
      if (paramName === 'ticker') return 'TEST';
      if (paramName === 'size') return 25;
      if (paramName === 'start') return '';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactionsData);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockTransactionsData);
  });

  test('should get asset documents', async () => {
    const mockDocumentsData = {
      results: [
        { name: 'Whitepaper', uri: 'https://example.com/whitepaper.pdf' },
        { name: 'Terms', uri: 'https://example.com/terms.pdf' },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getAssetDocuments';
      if (paramName === 'ticker') return 'TEST';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockDocumentsData);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockDocumentsData);
  });

  test('should get compliance requirements', async () => {
    const mockComplianceData = {
      requirements: [
        { id: '1', type: 'MaxInvestorCount', value: '200' },
        { id: '2', type: 'MaxInvestorOwnership', value: '10' },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getComplianceRequirements';
      if (paramName === 'ticker') return 'TEST';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockComplianceData);

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockComplianceData);
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getAsset';
      if (paramName === 'ticker') return 'INVALID';
      return undefined;
    });

    const apiError = new Error('Asset not found');
    (apiError as any).httpCode = '404';
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    await expect(
      executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Asset not found');
  });

  test('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getAsset';
      if (paramName === 'ticker') return 'INVALID';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Portfolios Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.polymesh.network/api/v1',
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

  describe('getPortfolio operation', () => {
    it('should get portfolio details successfully', async () => {
      const mockResponse = {
        id: 'portfolio-123',
        did: '0x123',
        name: 'Test Portfolio',
        totalValue: '100000',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        if (param === 'operation') return 'getPortfolio';
        if (param === 'did') return '0x123';
        if (param === 'portfolioId') return 'portfolio-123';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePortfoliosOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/portfolios/0x123/portfolio-123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when getting portfolio fails', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        if (param === 'operation') return 'getPortfolio';
        if (param === 'did') return '0x123';
        if (param === 'portfolioId') return 'portfolio-123';
        return '';
      });

      const error = new Error('Portfolio not found');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(
        executePortfoliosOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('Portfolio not found');
    });
  });

  describe('getPortfoliosByDid operation', () => {
    it('should get portfolios by DID successfully', async () => {
      const mockResponse = {
        portfolios: [
          { id: 'portfolio-1', name: 'Portfolio 1' },
          { id: 'portfolio-2', name: 'Portfolio 2' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        if (param === 'operation') return 'getPortfoliosByDid';
        if (param === 'did') return '0x123';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePortfoliosOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/portfolios/0x123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getPortfolioMovements operation', () => {
    it('should get portfolio movements successfully', async () => {
      const mockResponse = {
        movements: [
          { type: 'transfer', amount: '1000', ticker: 'ACME' },
          { type: 'purchase', amount: '500', ticker: 'TEST' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'operation') return 'getPortfolioMovements';
        if (param === 'did') return '0x123';
        if (param === 'portfolioId') return 'portfolio-123';
        if (param === 'address') return defaultValue || '';
        if (param === 'ticker') return defaultValue || '';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePortfoliosOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should include query parameters when provided', async () => {
      const mockResponse = { movements: [] };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'operation') return 'getPortfolioMovements';
        if (param === 'did') return '0x123';
        if (param === 'portfolioId') return 'portfolio-123';
        if (param === 'address') return '0xaddress123';
        if (param === 'ticker') return 'ACME';
        return defaultValue || '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      await executePortfoliosOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/portfolios/0x123/portfolio-123/movements?address=0xaddress123&ticker=ACME',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getPortfolioBalances operation', () => {
    it('should get portfolio balances successfully', async () => {
      const mockResponse = {
        balances: [
          { ticker: 'ACME', balance: '10000' },
          { ticker: 'TEST', balance: '5000' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        if (param === 'operation') return 'getPortfolioBalances';
        if (param === 'did') return '0x123';
        if (param === 'portfolioId') return 'portfolio-123';
        return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePortfoliosOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/portfolios/0x123/portfolio-123/balances',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should continue on fail when continueOnFail is true', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        if (param === 'operation') return 'getPortfolio';
        return '';
      });

      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const result = await executePortfoliosOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });

    it('should throw error for unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
        if (param === 'operation') return 'unknownOperation';
        return '';
      });

      await expect(
        executePortfoliosOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('The operation "unknownOperation" is not supported!');
    });
  });
});

describe('Settlements Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.polymesh.network/api/v1',
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

  describe('getSettlement operation', () => {
    it('should get settlement details successfully', async () => {
      const mockSettlement = {
        id: '123',
        status: 'pending',
        legs: [],
        createdAt: '2024-01-01T00:00:00Z'
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSettlement';
        if (param === 'id') return '123';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSettlement);

      const result = await executeSettlementsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockSettlement, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/settlements/123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getSettlement error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSettlement';
        if (param === 'id') return '123';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Settlement not found'));

      await expect(
        executeSettlementsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Settlement not found');
    });
  });

  describe('listSettlements operation', () => {
    it('should list settlements with filters successfully', async () => {
      const mockSettlements = {
        results: [
          { id: '123', status: 'pending' },
          { id: '124', status: 'executed' }
        ],
        next: null
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'listSettlements';
        if (param === 'status') return 'pending';
        if (param === 'involvedParty') return 'did:polymesh:123';
        if (param === 'size') return 25;
        if (param === 'start') return '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSettlements);

      const result = await executeSettlementsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockSettlements, pairedItem: { item: 0 } }]);
    });
  });

  describe('getSettlementLegs operation', () => {
    it('should get settlement legs successfully', async () => {
      const mockLegs = {
        legs: [
          { from: 'did:polymesh:123', to: 'did:polymesh:456', asset: 'ACME', amount: '1000' }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSettlementLegs';
        if (param === 'id') return '123';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockLegs);

      const result = await executeSettlementsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockLegs, pairedItem: { item: 0 } }]);
    });
  });

  describe('getSettlementAffirmations operation', () => {
    it('should get settlement affirmations successfully', async () => {
      const mockAffirmations = {
        affirmations: [
          { party: 'did:polymesh:123', status: 'affirmed' },
          { party: 'did:polymesh:456', status: 'pending' }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSettlementAffirmations';
        if (param === 'id') return '123';
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAffirmations);

      const result = await executeSettlementsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: mockAffirmations, pairedItem: { item: 0 } }]);
    });
  });

  describe('error handling', () => {
    it('should handle unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'unknownOperation';
      });

      await expect(
        executeSettlementsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Unknown operation: unknownOperation');
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSettlement';
        if (param === 'id') return '123';
      });

      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeSettlementsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Instructions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.polymesh.network/api/v1',
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

  describe('getInstruction', () => {
    it('should retrieve instruction details by ID', async () => {
      const mockResponse = {
        id: '123',
        status: 'pending',
        createdAt: '2023-01-01T00:00:00Z',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getInstruction';
        if (param === 'instructionId') return '123';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInstructionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/instructions/123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle errors when getting instruction fails', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getInstruction';
        if (param === 'instructionId') return 'invalid-id';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
        new Error('Instruction not found')
      );

      await expect(
        executeInstructionsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Instruction not found');
    });
  });

  describe('listInstructions', () => {
    it('should list instructions with filters', async () => {
      const mockResponse = {
        results: [
          { id: '123', status: 'pending' },
          { id: '124', status: 'pending' },
        ],
        totalCount: 2,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'listInstructions';
        if (param === 'status') return 'pending';
        if (param === 'size') return 10;
        if (param === 'start') return '';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInstructionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/instructions?status=pending&size=10',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getInstructionLegs', () => {
    it('should get instruction legs', async () => {
      const mockResponse = {
        legs: [
          { from: 'portfolio1', to: 'portfolio2', asset: 'ASSET1', amount: '100' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getInstructionLegs';
        if (param === 'instructionId') return '123';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInstructionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/instructions/123/legs',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getInstructionAffirmations', () => {
    it('should get instruction affirmations', async () => {
      const mockResponse = {
        affirmations: [
          { identity: 'identity1', status: 'pending' },
          { identity: 'identity2', status: 'affirmed' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getInstructionAffirmations';
        if (param === 'instructionId') return '123';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInstructionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/instructions/123/affirmations',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getInstructionEvents', () => {
    it('should get instruction events', async () => {
      const mockResponse = {
        events: [
          { type: 'InstructionCreated', blockNumber: 1000, timestamp: '2023-01-01T00:00:00Z' },
          { type: 'InstructionAffirmed', blockNumber: 1001, timestamp: '2023-01-01T00:01:00Z' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getInstructionEvents';
        if (param === 'instructionId') return '123';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeInstructionsOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/instructions/123/events',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Claims Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.polymesh.network/api/v1',
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

  test('listClaims should return claims with filtering', async () => {
    const mockResponse = {
      claims: [
        {
          id: 'claim-1',
          target: 'target-did',
          issuer: 'issuer-did',
          type: 'Jurisdiction',
          value: 'US',
        },
      ],
      total: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'listClaims',
        target: 'target-did',
        issuer: 'issuer-did',
        claimTypes: 'Jurisdiction',
        size: 25,
        start: '',
      };
      return params[param];
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeClaimsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.polymesh.network/api/v1/claims?target=target-did&issuer=issuer-did&claimTypes=Jurisdiction&size=25',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getClaimsByTarget should return claims for specific identity', async () => {
    const mockResponse = {
      claims: [
        {
          id: 'claim-1',
          target: '0x123abc',
          issuer: 'issuer-did',
          type: 'Accredited',
          value: true,
          expiry: null,
        },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getClaimsByTarget',
        targetIdentity: '0x123abc',
        claimTypes: 'Accredited',
        includeExpired: false,
      };
      return params[param];
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeClaimsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.polymesh.network/api/v1/claims/0x123abc?claimTypes=Accredited&includeExpired=false',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getClaimIssuers should return list of claim issuers', async () => {
    const mockResponse = {
      issuers: [
        {
          did: 'issuer-did-1',
          name: 'KYC Provider 1',
          claimCount: 150,
        },
        {
          did: 'issuer-did-2',
          name: 'Accreditation Authority',
          claimCount: 75,
        },
      ],
      total: 2,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getClaimIssuers',
        size: 10,
        start: '',
      };
      return params[param];
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeClaimsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://mainnet-api.polymesh.network/api/v1/claims/issuers?size=10',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('should handle API errors properly', async () => {
    const mockError = {
      httpCode: 404,
      message: 'Target identity not found',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getClaimsByTarget',
        targetIdentity: 'invalid-did',
        claimTypes: '',
        includeExpired: false,
      };
      return params[param];
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    await expect(
      executeClaimsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });

  test('should continue on fail when configured', async () => {
    const mockError = new Error('Network error');

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'listClaims',
        target: '',
        issuer: '',
        claimTypes: '',
        size: 25,
        start: '',
      };
      return params[param];
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    const result = await executeClaimsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([
      { json: { error: 'Network error' }, pairedItem: { item: 0 } }
    ]);
  });
});

describe('Blocks Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.polymesh.network/api/v1',
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

  describe('getLatestBlock', () => {
    it('should get latest block successfully', async () => {
      const mockResponse = {
        hash: '0x123',
        number: 12345,
        timestamp: '2024-01-01T00:00:00Z',
        parentHash: '0x456',
        extrinsics: [],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getLatestBlock';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/blocks/latest',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors for getLatestBlock', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getLatestBlock';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getBlock', () => {
    it('should get block by ID successfully', async () => {
      const mockResponse = {
        hash: '0x123',
        number: 12345,
        timestamp: '2024-01-01T00:00:00Z',
        parentHash: '0x456',
        extrinsics: [],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getBlock';
        if (param === 'blockId') return '12345';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/blocks/12345',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should throw error when blockId is missing', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getBlock';
        if (param === 'blockId') return '';
        return undefined;
      });

      await expect(executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]))
        .rejects
        .toThrow('Block ID is required for getBlock operation');
    });
  });

  describe('listBlocks', () => {
    it('should list blocks with pagination successfully', async () => {
      const mockResponse = {
        results: [
          { hash: '0x123', number: 12345 },
          { hash: '0x456', number: 12346 },
        ],
        next: 'next-cursor',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'operation') return 'listBlocks';
        if (param === 'size') return 25;
        if (param === 'start') return 'start-cursor';
        return defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/blocks?size=25&start=start-cursor',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getBlockTransactions', () => {
    it('should get block transactions successfully', async () => {
      const mockResponse = {
        transactions: [
          { hash: '0xabc', blockNumber: 12345 },
          { hash: '0xdef', blockNumber: 12345 },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getBlockTransactions';
        if (param === 'blockId') return '12345';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/blocks/12345/transactions',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should throw error when blockId is missing for transactions', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getBlockTransactions';
        if (param === 'blockId') return '';
        return undefined;
      });

      await expect(executeBlocksOperations.call(mockExecuteFunctions, [{ json: {} }]))
        .rejects
        .toThrow('Block ID is required for getBlockTransactions operation');
    });
  });
});

describe('Transactions Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://mainnet-api.polymesh.network/api/v1',
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

  describe('getTransaction', () => {
    it('should get transaction details successfully', async () => {
      const mockTransaction = {
        txHash: '0x123abc',
        blockNumber: 12345,
        status: 'success',
        from: '0xabc123',
        to: '0xdef456',
        value: '1000000000000000000',
        gas: 21000,
        gasPrice: '20000000000'
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransaction';
        if (paramName === 'txHash') return '0x123abc';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransaction);

      const items = [{ json: {} }];
      const result = await executeTransactionsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockTransaction);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/transactions/0x123abc',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });

    it('should handle missing transaction hash error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransaction';
        if (paramName === 'txHash') return '';
        return undefined;
      });

      const items = [{ json: {} }];

      await expect(executeTransactionsOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('Transaction hash is required');
    });
  });

  describe('listTransactions', () => {
    it('should list transactions with filters successfully', async () => {
      const mockTransactions = {
        transactions: [
          { txHash: '0x123abc', blockNumber: 12345 },
          { txHash: '0x456def', blockNumber: 12346 }
        ],
        total: 2
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'listTransactions';
        if (paramName === 'blockNumber') return 12345;
        if (paramName === 'address') return '0xabc123';
        if (paramName === 'size') return 20;
        if (paramName === 'start') return 0;
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactions);

      const items = [{ json: {} }];
      const result = await executeTransactionsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockTransactions);
    });

    it('should handle API error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'listTransactions';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];

      await expect(executeTransactionsOperations.call(mockExecuteFunctions, items))
        .rejects.toThrow('API Error');
    });
  });

  describe('getTransactionEvents', () => {
    it('should get transaction events successfully', async () => {
      const mockEvents = {
        events: [
          { event: 'Transfer', args: { from: '0xabc', to: '0xdef', value: '1000' } },
          { event: 'Approval', args: { owner: '0xabc', spender: '0xdef', value: '2000' } }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransactionEvents';
        if (paramName === 'txHash') return '0x123abc';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockEvents);

      const items = [{ json: {} }];
      const result = await executeTransactionsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockEvents);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://mainnet-api.polymesh.network/api/v1/transactions/0x123abc/events',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });

    it('should handle continueOnFail', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTransactionEvents';
        if (paramName === 'txHash') return '';
        return undefined;
      });

      const items = [{ json: {} }];
      const result = await executeTransactionsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Transaction hash is required');
    });
  });
});
});
