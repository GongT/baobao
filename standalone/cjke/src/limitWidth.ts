import { readFirstCompleteChar } from './firstCompleteChar';
import { allSupport, SupportInfo } from './base';

export interface LimitResult {
	toString(): string;

	result: string;
	width: number;
}

function returnValue(result: string, width: number): LimitResult {
	return {
		result,
		width,
		toString() {
			return result;
		},
		[Symbol.toPrimitive]() {
			return result;
		},
	} as any;
}

export function limitWidth(original: string, limit: number, supports: SupportInfo = allSupport): LimitResult {
	let width = 0;
	let str = original;
	while (str.length > 0) {
		const item = readFirstCompleteChar(str, supports);

		const nextWidth = width + item.width;
		if (nextWidth > limit) {
			return returnValue(original.slice(0, original.length - str.length), width);
		}
		width += item.width;
		if (width === limit) {
			return returnValue(original.slice(0, original.length - str.length + item.length), width);
		}

		str = str.slice(item.length);
	}

	return returnValue(original, width);
}
