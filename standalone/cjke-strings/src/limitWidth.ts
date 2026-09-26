import type { SupportInfo } from './support-info.js';
import { everything } from './support-info.predefine.js';
import { readFirstCompleteChar } from './firstCompleteChar.js';

export interface LimitResult {
	toString(): string;

	readonly result: string;
	readonly remaining: string;
	readonly width: number;
	[Symbol.toPrimitive](): string;
}

function toResult(text: string, width: number, remaining: string): LimitResult {
	const r = {
		result: text,
		remaining,
		width,
		toString() {
			return r.result;
		},
		[Symbol.toPrimitive]() {
			return r.result;
		},
	};
	return r;
}

function returnValue(original: string, length: number, width: number): LimitResult {
	const result = Number.isFinite(length) ? original.slice(0, length) : original;
	const remaining = Number.isFinite(length) ? original.slice(length) : '';
	return toResult(result, width, remaining);
}

type Writable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * 限制字符串的显示宽度，并在不足时进行填充，使结果永远保持指定的宽度
 */
export function fixedWidth(original: string, limit: number, supports: SupportInfo = everything): LimitResult {
	const result: Writable<LimitResult> = limitWidth(original, limit, supports);
	const padding = limit - result.width;
	if (padding > 0) {
		result.result += ' '.repeat(padding);
		result.width += padding;
	}
	return result;
}

/**
 * 获取多行文本中最长行的显示宽度
 */
export function maxWidthMultiline(original: string, supports: SupportInfo = everything): number {
	const lines = original.split('\n');
	let maxWidth = 0;
	for (const line of lines) {
		const width = limitWidth(line, Number.POSITIVE_INFINITY, supports).width;
		if (width > maxWidth) {
			maxWidth = width;
		}
	}
	return maxWidth;
}

type IFixedMultiline = {
	maxWidth: number;
	result: string[];
};

/**
 * 填充多行文本的结尾空格，使每一行保持其中最长行的宽度
 * @param limit 可选宽度限制，默认无限
 *
 * @returns 返回限制宽度后的文本和最长行宽度值（无关limit参数）
 */
export function fixedWidthMultiline(original: string, limit: number = Infinity, supports: SupportInfo = everything): IFixedMultiline {
	const lines = original.split('\n');
	const maxWidth = maxWidthMultiline(original, supports);
	const limited = Math.min(maxWidth, limit);
	const r = [];
	for (const line of lines) {
		r.push(fixedWidth(line, limited, supports).result);
	}
	return { maxWidth, result: r };
}

/**
 * 限制字符串的显示宽度
 */
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

/**
 * 将文本按指定宽度分块
 */
export function chunkText(text: string, width: number, supports: SupportInfo = everything) {
	const result = [];
	while (text.length > 0) {
		const item = limitWidth(text, width, supports);
		result.push(item.toString());
		text = item.remaining;
	}
	return result;
}

/**
 * 将文本按指定宽度分块，并保持原有的换行
 */
export function boxText(text: string, width: number, supports: SupportInfo = everything) {
	const lines = text.split('\n');
	const result: string[] = [];
	for (const line of lines) {
		result.push(...chunkText(line, width, supports));
	}
	return result;
}
