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
};
type DebugCommands = Record<string, (arg: unknown, color: boolean) => string>;

export function call_debug_command(command: keyof typeof debug_commands | string, arg: unknown, color: boolean): string {
	const fn = (debug_commands as DebugCommands)[command];
	if (!fn) {
		return color_error(`unknown command ${command}`, color);
	}
	return fn(arg, color);
}
