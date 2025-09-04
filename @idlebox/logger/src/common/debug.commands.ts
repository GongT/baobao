import { relative } from 'node:path';
import { formatWithOptions, inspect } from 'node:util';
import { Cdim, Cdimita, CFgreen, CFred, Cita, Crst, NCF, NCita } from './ansi.js';
import type { IDebugCommand } from './types.js';

const STRING_MAX_LENGTH = 128;

function color_error(message: string, color: boolean) {
	if (color) {
		return `${CFred}<inspect**${message}**>${NCF}`;
	} else {
		return `<inspect**${message}**>`;
	}
}

function options(color: boolean) {
	return {
		depth: 5,
		compact: true,
		colors: color,
		maxArrayLength: 3,
		maxStringLength: STRING_MAX_LENGTH,
	};
}

export function nodeFormat(message: string, object: readonly unknown[], color: boolean): string {
	return formatWithOptions(options(color), message, ...object);
}

export function nodeInspect(object: unknown, color: boolean): string {
	return inspect(object, options(color));
}

function isSyncIterable(obj: unknown): obj is Iterable<unknown> {
	return typeof obj === 'object' && obj !== null && Symbol.iterator in obj;
}

export const debug_commands: Record<string, IDebugCommand> = {
	inspect(object: unknown, color: boolean) {
		return inspect(object, options(color));
	},
	stripe(s: unknown, color: boolean) {
		if (typeof s !== 'string') {
			return color_error(`can not stripe ${typeof s}`, color);
		}
		let str = s;
		str = str.replace(/\n/g, '\\n');
		str = str.replace(/\r/g, '\\r');
		str = str.replace(/\t/g, '\\t');
		str = str.replace(/\x1B/g, '\\e');
		if (str.length > STRING_MAX_LENGTH) {
			const chars = `(${str.length.toFixed(0)} chars)`;
			if (color) {
				return `"${CFgreen}${str.slice(0, STRING_MAX_LENGTH - chars.length - 3)}...${NCF} ${chars}"`;
			} else {
				return `"${CFgreen}${str}${NCF}"`;
			}
		} else {
			return str;
		}
	},
	list(items: unknown, color: boolean) {
		if (!isSyncIterable(items)) {
			return color_error(`list<> need iterable value, not ${typeof items}(${items?.constructor?.name})`, color);
		}
		const postfix = color ? Crst : '';
		let index = 0;
		const lines: string[] = [];
		const prefix = color ? Cdim : '';
		for (const item of items) {
			if (Array.isArray(item)) {
				if (item.length === 2) {
					const [key, value] = item;
					if (typeof key === 'number') {
						lines.push(`  - ${prefix}${item}${postfix}`);
					} else {
						lines.push(`  * ${prefix}${key}: ${value.toString()}${postfix}`);
					}
				} else {
					return color_error(`list<> item ${index} is array with length ${item.length}, expected 2`, color);
				}
			} else {
				lines.push(`  - ${prefix}${item}${postfix}`);
			}
			index++;
		}

		if (lines.length === 0) {
			const prefix = color ? Cdimita : '';
			return `:\n${prefix}  - <list is empty>${postfix}`;
		}
		return `:\n${lines.join('\n')}`;
	},
	commandline(cmds: unknown, color: boolean) {
		if (Array.isArray(cmds)) {
			const prefix = color ? Cdim : '';
			const postfix = color ? Crst : '';
			return prefix + cmds.map((s) => JSON.stringify(s)).join(' ') + postfix;
		} else if (typeof cmds === 'string') {
			const prefix = color ? Cdimita : '';
			const postfix = color ? Crst : '';
			return prefix + cmds + postfix;
		} else {
			return color_error(`commandline<> need string or array, not ${typeof cmds}`, color);
		}
	},
	long(s: unknown, color: boolean) {
		if (typeof s !== 'string') {
			if (Array.isArray(s)) {
				s = `[${s.join(', ')}]`;
			} else {
				return color_error(`long<> need string, not ${typeof s}(${s?.constructor?.name})`, color);
			}
		}
		if (color) {
			return `${Cita}${s}${NCita}`;
		} else {
			return s as string;
		}
	},
	relative(s: unknown, color: boolean) {
		if (typeof s !== 'string') {
			return color_error(`relative<> need string, not ${typeof s}(${s?.constructor?.name})`, color);
		}
		return relative(process.cwd(), s);
	},
	printable(data: unknown, color: boolean) {
		if (typeof data !== 'string') {
			if (data?.toString) {
				data = data.toString();
			} else {
				return color_error(`printable<> need string or toString(), not ${typeof data}(${data?.constructor?.name})`, color);
			}
		}
		return (data as string).replace(combinedSequence, '');
	},
};
type DebugCommands = Record<string, (arg: unknown, color: boolean) => string>;
const controlCharacters = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g; // 除了 \t \n \r 之外的控制字符
const csiSequence = /\x1B\[[\x30–\x3F]*[\x20-\x2F]*[\x40-\x7E]/g; // ANSI CSI序列
const oscSequence = /\x1B\][^\x1B\x07]*(\x1B\\|\x07)/g; // ANSI OSC序列
const pmApcSequence = /\x1B[_^][^\x1B\x07]*\x1B\\/g; // ANSI PM/APC序列
const dcsSequence = /\x1B[\x20-\x7E\x08-\x0D]*\x1B\\/g; // ANSI DCS序列
const sosSequence = /\x1B[\s\S]+?\x1B\\/g; // ANSI SOS序列
const otherC1 = /\x1B[\x80-\x9F]/g; // 其他C1控制字符
const combinedSequence = new RegExp(
	[csiSequence.source, oscSequence.source, pmApcSequence.source, dcsSequence.source, sosSequence.source, otherC1.source, controlCharacters.source].join('|'),
	'g',
);

export function call_debug_command(command: keyof typeof debug_commands | string, arg: unknown, color: boolean): string {
	const fn = (debug_commands as DebugCommands)[command];
	if (!fn) {
		return color_error(`unknown command ${command}`, color);
	}
	return fn(arg, color);
}
