import { readFirstCompleteChar } from './firstCompleteChar';
import { allSupport, SupportInfo } from './base';

export function stringWidth(str: string, supports: SupportInfo = allSupport) {
	let width = 0;
	while (str.length > 0) {
		const item = readFirstCompleteChar(str, supports);
		width += item.width;

		str = str.slice(item.length);
	}
	return width;
}
