import { table } from './table.js';
import type { IArgDefine } from './types.js';

interface IFormatOptions {
	color: string;
	indent?: string;
}
export function formatOptions(args: Record<string, IArgDefine>, { color, indent }: IFormatOptions) {
	if (!color) color = '';
	if (!indent) indent = '';

	const tbl = table(color, indent);
	for (const [name, { description, flag }] of Object.entries(args)) {
		const names = name.split(',').map((n) => {
			n = n.trim();
			if (!n.startsWith('-')) {
				if (n.length > 1) {
					n = `--${n}`;
				} else {
					n = `-${n}`;
				}
			}
			return n;
		});

		const flag_suffix = flag ? '' : ' <value>';

		tbl.line(names.join(', '), flag_suffix, description);
	}
	return tbl.emit();
}

export function c(color: string, text: string) {
	if (!color) return text;
	return `\x1B[${color}m${text}\x1B[0m`;
}
