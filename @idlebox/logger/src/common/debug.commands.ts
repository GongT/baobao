import { relative } from 'node:path';
import { formatWithOptions, inspect } from 'node:util';

const STRING_MAX_LENGTH = 128;

function color_error(message: string, color: boolean) {
	if (color) {
		return `\x1B[38;5;9m<inspect**${message}**>\x1B[39m`;
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

const debug_commands = {
	inspect(object: unknown, color: boolean) {
		return inspect(object, options(color));
	},
	stripe(s: unknown, color: boolean) {
		if (typeof s !== 'string') {
			return color_error(`can not stripe ${typeof s}`, color);
		}
		if (s.length > 100) {
			if (color) {
				return `\x1B[38;5;10m"${s.slice(0, STRING_MAX_LENGTH - 3)}..."\x1B[39m`;
			} else {
				return `"${s.slice(0, STRING_MAX_LENGTH - 3)}..."`;
			}
		} else {
			return s;
		}
	},
	list(items: unknown, color: boolean) {
		if (!isSyncIterable(items)) {
			return color_error(`list<> need iterable value, not ${typeof items}(${items?.constructor?.name})`, color);
		}
		const postfix = color ? '\x1B[0m' : '';
		let index = 0;
		const lines: string[] = [];
		const prefix = color ? '\x1B[2m' : '';
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
			const prefix = color ? '\x1B[3;2m' : '';
			return ':\n' + prefix + '  - <list is empty>' + postfix;
		}
		return ':\n' + lines.join('\n');
	},
	commandline(cmds: unknown, color: boolean) {
		if (Array.isArray(cmds)) {
			const prefix = color ? '\x1B[2m' : '';
			const postfix = color ? '\x1B[0m' : '';
			return prefix + cmds.map((s) => JSON.stringify(s)).join(' ') + postfix;
		} else if (typeof cmds === 'string') {
			const prefix = color ? '\x1B[2;3m' : '';
			const postfix = color ? '\x1B[0m' : '';
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
			return `\x1B[3m${s}\x1B[23m`;
		} else {
			return s;
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

export function call_debug_command(
	command: keyof typeof debug_commands | string,
	arg: unknown,
	color: boolean,
): string {
	const fn = (debug_commands as DebugCommands)[command];
	if (!fn) {
		return color_error(`unknown command ${command}`, color);
	}
	return fn(arg, color);
}
