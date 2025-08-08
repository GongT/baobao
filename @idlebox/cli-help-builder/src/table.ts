import { c } from './format.js';

export function table(color: string, line_prefix: string = '  ') {
	const elements: [string, string, string][] = [];

	return {
		line(left: string, uncolor_left: string, right: string) {
			elements.push([left, uncolor_left, right]);
		},
		emit() {
			let r = '';
			const max_left = Math.max(...elements.map((s) => s[0].length + s[1].length));

			for (const [left, uncolor_left, right] of elements) {
				r += `${line_prefix}${c(color, left)}${uncolor_left.padEnd(max_left - left.length)}  ${right}\n`;
			}
			return r;
		},
	};
}
