import { everything, type SupportInfo } from './base.js';
import { readFirstCompleteChar } from './firstCompleteChar.js';

export interface LimitResult {
	toString(): string;

	readonly result: string;
	readonly remaining: string;
	readonly width: number;
}

function returnValue(original: string, length: number, width: number): LimitResult {
	const result = Number.isFinite(length) ? original.slice(0, length) : original;
	const remaining = Number.isFinite(length) ? original.slice(length) : '';
	return {
		result,
		width,
		remaining,
		toString() {
			return result;
		},
		[Symbol.toPrimitive]() {
			return result;
		},
	} as any;
}

export function limitWidth(original: string, limit: number, supports: SupportInfo = everything): LimitResult {
	let width = 0;
	let str = original;
	while (str.length > 0) {
		const item = readFirstCompleteChar(str, supports);

		const nextWidth = width + item.width;
		if (nextWidth > limit) {
			return returnValue(original, original.length - str.length, width);
		}
		width += item.width;
		if (width === limit) {
			return returnValue(original, original.length - str.length + item.length, width);
		}

		str = str.slice(item.length);
	}

	return returnValue(original, Number.POSITIVE_INFINITY, width);
}

export function chunkText(text: string, width: number, supports: SupportInfo = everything) {
	const result = [];
	while (text.length > 0) {
		const item = limitWidth(text, width, supports);
		result.push(item.toString());
		text = item.remaining;
	}
	return result;
}
export function boxText(text: string, width: number, supports: SupportInfo = everything) {
	const lines = text.split('\n');
	const result: string[] = [];
	for (const line of lines) {
		result.push(...chunkText(line, width, supports));
	}
	return result;
}
