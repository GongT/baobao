import { readFirstCompleteChar } from './firstCompleteChar.js';
import { everything, type SupportInfo } from './base.js';

export function stringWidth(str: string, supports: SupportInfo = everything) {
	let width = 0;
	while (str.length > 0) {
		const item = readFirstCompleteChar(str, supports);
		width += item.width;

		str = str.slice(item.length);
	}
	return width;
}
