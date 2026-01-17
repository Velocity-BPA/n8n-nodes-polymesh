/**
 * Polymesh Unit Converter
 * 
 * Helper functions for converting between POLYX units and human-readable values.
 * POLYX has 6 decimal places.
 */

import { POLYX_DECIMALS } from '../constants/networks';

// BigInt constants for unit conversion
const POLYX_MULTIPLIER = BigInt(10 ** POLYX_DECIMALS);

/**
 * Convert POLYX to smallest unit (micro-POLYX)
 */
export function toMicroPolyx(polyx: string | number): string {
	const amount = typeof polyx === 'string' ? parseFloat(polyx) : polyx;
	
	if (isNaN(amount)) {
		throw new Error('Invalid POLYX amount');
	}
	
	// Handle decimal precision carefully
	const [whole, decimal = ''] = amount.toString().split('.');
	const paddedDecimal = decimal.padEnd(POLYX_DECIMALS, '0').slice(0, POLYX_DECIMALS);
	
	return BigInt(whole + paddedDecimal).toString();
}

/**
 * Convert smallest unit (micro-POLYX) to POLYX
 */
export function fromMicroPolyx(microPolyx: bigint | string | number): string {
	const amount = BigInt(microPolyx);
	const whole = amount / POLYX_MULTIPLIER;
	const fraction = amount % POLYX_MULTIPLIER;
	
	if (fraction === BigInt(0)) {
		return whole.toString();
	}
	
	const fractionStr = fraction.toString().padStart(POLYX_DECIMALS, '0');
	// Remove trailing zeros
	const trimmed = fractionStr.replace(/0+$/, '');
	
	return `${whole}.${trimmed}`;
}

/**
 * Format POLYX for display with symbol
 */
export function formatPolyx(microPolyx: bigint | string | number): string {
	return `${fromMicroPolyx(microPolyx)} POLYX`;
}

/**
 * Parse a human-readable amount to bigint
 * Handles both integer and decimal inputs
 */
export function parseAmount(amount: string | number, decimals: number = POLYX_DECIMALS): bigint {
	const amountStr = amount.toString().trim();
	
	if (!/^-?\d*\.?\d*$/.test(amountStr)) {
		throw new Error(`Invalid amount format: ${amount}`);
	}
	
	const isNegative = amountStr.startsWith('-');
	const absAmount = isNegative ? amountStr.slice(1) : amountStr;
	
	const [whole = '0', decimal = ''] = absAmount.split('.');
	const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);
	
	let result = BigInt(whole + paddedDecimal);
	
	if (isNegative) {
		result = -result;
	}
	
	return result;
}

/**
 * Format a bigint amount to human-readable string
 */
export function formatAmount(amount: bigint | string | number, decimals: number = POLYX_DECIMALS): string {
	const amountBigInt = BigInt(amount);
	const isNegative = amountBigInt < BigInt(0);
	const absAmount = isNegative ? -amountBigInt : amountBigInt;
	
	const multiplier = BigInt(10 ** decimals);
	const whole = absAmount / multiplier;
	const fraction = absAmount % multiplier;
	
	let result: string;
	
	if (fraction === BigInt(0)) {
		result = whole.toString();
	} else {
		const fractionStr = fraction.toString().padStart(decimals, '0');
		const trimmed = fractionStr.replace(/0+$/, '');
		result = `${whole}.${trimmed}`;
	}
	
	return isNegative ? `-${result}` : result;
}

/**
 * Add two amounts (handles string/number/bigint)
 */
export function addAmounts(a: string | number | bigint, b: string | number | bigint): bigint {
	return BigInt(a) + BigInt(b);
}

/**
 * Subtract two amounts
 */
export function subtractAmounts(a: string | number | bigint, b: string | number | bigint): bigint {
	return BigInt(a) - BigInt(b);
}

/**
 * Multiply amount by a factor
 */
export function multiplyAmount(amount: string | number | bigint, factor: number): bigint {
	const amountBigInt = BigInt(amount);
	// Use integer math for precision
	const factorInt = Math.floor(factor * 1000000);
	return (amountBigInt * BigInt(factorInt)) / BigInt(1000000);
}

/**
 * Calculate percentage of an amount
 */
export function percentageOf(amount: string | number | bigint, percentage: number): bigint {
	return multiplyAmount(amount, percentage / 100);
}

/**
 * Compare two amounts
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareAmounts(a: string | number | bigint, b: string | number | bigint): -1 | 0 | 1 {
	const aBigInt = BigInt(a);
	const bBigInt = BigInt(b);
	
	if (aBigInt < bBigInt) return -1;
	if (aBigInt > bBigInt) return 1;
	return 0;
}

/**
 * Check if amount is zero
 */
export function isZero(amount: string | number | bigint): boolean {
	return BigInt(amount) === BigInt(0);
}

/**
 * Check if amount is positive
 */
export function isPositive(amount: string | number | bigint): boolean {
	return BigInt(amount) > BigInt(0);
}

/**
 * Check if amount is negative
 */
export function isNegative(amount: string | number | bigint): boolean {
	return BigInt(amount) < BigInt(0);
}

/**
 * Get minimum of two amounts
 */
export function minAmount(a: string | number | bigint, b: string | number | bigint): bigint {
	const aBigInt = BigInt(a);
	const bBigInt = BigInt(b);
	return aBigInt < bBigInt ? aBigInt : bBigInt;
}

/**
 * Get maximum of two amounts
 */
export function maxAmount(a: string | number | bigint, b: string | number | bigint): bigint {
	const aBigInt = BigInt(a);
	const bBigInt = BigInt(b);
	return aBigInt > bBigInt ? aBigInt : bBigInt;
}

/**
 * Format amount with thousands separators
 */
export function formatWithSeparators(amount: string | number | bigint, decimals: number = POLYX_DECIMALS): string {
	const formatted = formatAmount(amount, decimals);
	const [whole, decimal] = formatted.split('.');
	
	// Add thousands separators to whole part
	const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	
	return decimal ? `${withSeparators}.${decimal}` : withSeparators;
}

/**
 * Convert between different decimal precisions
 */
export function convertDecimals(
	amount: string | number | bigint,
	fromDecimals: number,
	toDecimals: number,
): bigint {
	const amountBigInt = BigInt(amount);
	
	if (fromDecimals === toDecimals) {
		return amountBigInt;
	}
	
	if (fromDecimals > toDecimals) {
		const divisor = BigInt(10 ** (fromDecimals - toDecimals));
		return amountBigInt / divisor;
	}
	
	const multiplier = BigInt(10 ** (toDecimals - fromDecimals));
	return amountBigInt * multiplier;
}

/**
 * Validate amount string
 */
export function isValidAmount(amount: string): boolean {
	if (!amount || typeof amount !== 'string') {
		return false;
	}
	
	return /^-?\d+(\.\d+)?$/.test(amount.trim());
}

/**
 * Round amount to specific decimal places
 */
export function roundAmount(amount: string | number | bigint, decimals: number, roundUp: boolean = false): bigint {
	const amountBigInt = BigInt(amount);
	const divisor = BigInt(10 ** (POLYX_DECIMALS - decimals));
	
	if (roundUp && amountBigInt % divisor !== BigInt(0)) {
		return ((amountBigInt / divisor) + BigInt(1)) * divisor;
	}
	
	return (amountBigInt / divisor) * divisor;
}
