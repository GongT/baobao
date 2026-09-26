import { readFirstCompleteChar } from './firstCompleteChar.js';
import type { SupportInfo } from './support-info.js';
import { everything } from './support-info.predefine.js';

export function stringWidth(str: string, supports: SupportInfo = everything) {
	let width = 0;
	while (str.length > 0) {
		const item = readFirstCompleteChar(str, supports);
		width += item.width;

		str = str.slice(item.length);
	}
	return width;
}
