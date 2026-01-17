/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { describe, it, expect } from '@jest/globals';

describe('Unit Converter Utils', () => {
	describe('toMicroPolyx', () => {
		it('should convert POLYX to micro POLYX', async () => {
			const { toMicroPolyx } = await import('../../nodes/Polymesh/utils/unitConverter');
			expect(toMicroPolyx('1')).toBe('1000000');
		});

		it('should handle decimal values', async () => {
			const { toMicroPolyx } = await import('../../nodes/Polymesh/utils/unitConverter');
			expect(toMicroPolyx('1.5')).toBe('1500000');
		});

		it('should handle zero', async () => {
			const { toMicroPolyx } = await import('../../nodes/Polymesh/utils/unitConverter');
			expect(toMicroPolyx('0')).toBe('0');
		});
	});

	describe('fromMicroPolyx', () => {
		it('should convert micro POLYX to POLYX', async () => {
			const { fromMicroPolyx } = await import('../../nodes/Polymesh/utils/unitConverter');
			expect(fromMicroPolyx('1000000')).toBe('1');
		});

		it('should handle fractional results', async () => {
			const { fromMicroPolyx } = await import('../../nodes/Polymesh/utils/unitConverter');
			expect(fromMicroPolyx('1500000')).toBe('1.5');
		});
	});
});

describe('Identity Utils', () => {
	describe('validateDid', () => {
		it('should validate correct DID format', async () => {
			const { validateDid } = await import('../../nodes/Polymesh/utils/identityUtils');
			const validDid = '0x0600000000000000000000000000000000000000000000000000000000000000';
			expect(validateDid(validDid)).toBe(true);
		});

		it('should reject invalid DID format', async () => {
			const { validateDid } = await import('../../nodes/Polymesh/utils/identityUtils');
			expect(validateDid('invalid')).toBe(false);
		});

		it('should reject DID without 0x prefix', async () => {
			const { validateDid } = await import('../../nodes/Polymesh/utils/identityUtils');
			const noPrefixDid = '0600000000000000000000000000000000000000000000000000000000000000';
			expect(validateDid(noPrefixDid)).toBe(false);
		});
	});

	describe('formatDid', () => {
		it('should format DID with checksum', async () => {
			const { formatDid } = await import('../../nodes/Polymesh/utils/identityUtils');
			const did = '0x0600000000000000000000000000000000000000000000000000000000000000';
			const formatted = formatDid(did);
			expect(formatted).toContain('0x');
		});
	});
});
