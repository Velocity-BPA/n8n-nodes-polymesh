/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
	IExecuteFunctions: {},
	INodeExecutionData: {},
	INodeType: {},
	INodeTypeDescription: {},
	NodeOperationError: class NodeOperationError extends Error {
		constructor(node: any, message: string) {
			super(message);
			this.name = 'NodeOperationError';
		}
	},
}));

describe('Polymesh Node', () => {
	describe('Node Description', () => {
		it('should have correct display name', async () => {
			const { Polymesh } = await import('../../nodes/Polymesh/Polymesh.node');
			const node = new Polymesh();
			expect(node.description.displayName).toBe('Polymesh');
		});

		it('should have correct name', async () => {
			const { Polymesh } = await import('../../nodes/Polymesh/Polymesh.node');
			const node = new Polymesh();
			expect(node.description.name).toBe('polymesh');
		});

		it('should have required credentials', async () => {
			const { Polymesh } = await import('../../nodes/Polymesh/Polymesh.node');
			const node = new Polymesh();
			expect(node.description.credentials).toBeDefined();
			expect(Array.isArray(node.description.credentials)).toBe(true);
		});
	});

	describe('Resources', () => {
		it('should have identity resource', async () => {
			const { Polymesh } = await import('../../nodes/Polymesh/Polymesh.node');
			const node = new Polymesh();
			const resourceProperty = node.description.properties?.find(
				(p: any) => p.name === 'resource'
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.options?.some((o: any) => o.value === 'identity')).toBe(true);
		});

		it('should have asset resource', async () => {
			const { Polymesh } = await import('../../nodes/Polymesh/Polymesh.node');
			const node = new Polymesh();
			const resourceProperty = node.description.properties?.find(
				(p: any) => p.name === 'resource'
			);
			expect(resourceProperty?.options?.some((o: any) => o.value === 'asset')).toBe(true);
		});

		it('should have settlement resource', async () => {
			const { Polymesh } = await import('../../nodes/Polymesh/Polymesh.node');
			const node = new Polymesh();
			const resourceProperty = node.description.properties?.find(
				(p: any) => p.name === 'resource'
			);
			expect(resourceProperty?.options?.some((o: any) => o.value === 'settlement')).toBe(true);
		});
	});
});

describe('Polymesh Trigger Node', () => {
	describe('Node Description', () => {
		it('should have correct display name', async () => {
			const { PolymeshTrigger } = await import('../../nodes/Polymesh/PolymeshTrigger.node');
			const node = new PolymeshTrigger();
			expect(node.description.displayName).toBe('Polymesh Trigger');
		});

		it('should be a trigger node', async () => {
			const { PolymeshTrigger } = await import('../../nodes/Polymesh/PolymeshTrigger.node');
			const node = new PolymeshTrigger();
			expect(node.description.group).toContain('trigger');
		});
	});
});
