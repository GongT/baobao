import { humanSize } from '@idlebox/common';

export interface ISectionData {
	readonly buffer: Buffer | NodeJS.ReadableStream;
	readonly start: number;
}

/** @internal */
export function hexNumber(pos: number) {
	let hex = pos.toString(16).toUpperCase();
	hex = hex.padStart(hex.length < 8 ? 8 : 16, '0');
	const hs = humanSize(pos);

	return `0x${hex} (${hs})`;
}

/** @internal */
export const erasedMark = Buffer.from('section is erase');
