import { defineInspectMethod } from '@idlebox/common';
import assert from 'node:assert';
import type { InspectContext } from 'node:util';
import { call_debug_command, debug_commands, nodeFormat } from '../functions/builtin-commands.js';
import { Cdim, Crst, CSI, NCdim } from './ansi.js';
import { LogLevel, logLevelPaddingStr, logTagColor } from './colors.js';
import { current_error_action, escapeRegExp } from './helpers.js';
import type { ILineWriter, IMyDebug, IMyDebugWithControl } from './types.js';

interface IDebugOptions {
	tag: string;
	level: LogLevel;
	colorEnabled: boolean;
	colorWholeLine?: boolean;
	writer: ILineWriter;
	enabled?: boolean;
}

/**
 * 创建一个debug函数
 * 在浏览器中必须指定stream
 */
export function createDebug({ tag, level, colorEnabled, colorWholeLine = false, writer, enabled = true }: IDebugOptions): IMyDebugWithControl {
	const color = logTagColor[level];
	const lineOpt = {
		tag: tag ? tag : `${LogLevel[level][0].toUpperCase()}`,
		writer,
		color,
		level,
	};

	let write_line: IMyDebug;
	if (!colorEnabled) {
		write_line = write_line_monolithic({
			...lineOpt,
			tag: tag ? tag : `$$`,
		});
	} else if (colorWholeLine) {
		write_line = write_line_colored_line(lineOpt);
	} else {
		write_line = write_line_colored_tag(lineOpt);
	}

	assert.equal(typeof writer, 'function', 'writer must be a function');

	const r = Object.defineProperties(
		(m: any, ...args: unknown[]) => {
			if (!enabled) return;
			write_line(m, ...args);
		},
		{
			displayName: {
				get() {
					return `writeLine:${LogLevel[level]}|${enabled ? 'enabled' : 'disabled'}`;
				},
				configurable: false,
			},
			enable: {
				value: function enable() {
					enabled = true;
				},
				configurable: false,
				writable: false,
			},
			disable: {
				value: function disable() {
					enabled = false;
				},
				configurable: false,
				writable: false,
			},
			isEnabled: {
				get() {
					return enabled;
				},
				configurable: false,
			},
			writeLine: {
				value: writer,
				enumerable: false,
				configurable: false,
				writable: false,
			},
		},
	) as IMyDebugWithControl;

	return defineInspectMethod(r, (_depth: number, context: InspectContext) => {
		return `[${context.stylize('Debug', 'special')} "${context.stylize(tag, 'string')}" ${context.stylize(LogLevel[level], 'undefined')} ${context.stylize(r.isEnabled ? 'enabled' : 'disabled', 'boolean')}]`;
	});
}

interface IWriteLineOptions {
	tag: string;
	writer: ILineWriter;
	color: string;
	level: LogLevel;
}

const commandsReg = new RegExp(`(${Object.keys(debug_commands).map(escapeRegExp).join('|')})<$`);

function format_template(messages: TemplateStringsArray, args: unknown[], color: boolean) {
	const result_messages: string[] = messages.slice();
	const result_args: string[] = [];
	for (const [index, arg] of args.entries()) {
		const prefix = result_messages[index] || '';
		const postfix = result_messages[index + 1] || '';

		if (prefix.at(-1) === '<' && postfix[0] === '>') {
			// 处理类似 relative<xxx> 的命令
			const lastWord = commandsReg.exec(prefix);
			if (lastWord) {
				const command = prefix.slice(lastWord.index, -1); // remove '<'
				const result = call_debug_command(command, arg, color);

				result_messages[index] = prefix.slice(0, lastWord.index);
				result_messages[index + 1] = postfix.slice(1);

				result_args.push(result);
				continue;
			}
		}

		if (typeof arg === 'string') {
			result_args.push(debug_commands.stripe(arg, color));
		} else if (typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'bigint' || typeof arg === 'symbol') {
			result_args.push(arg.toString());
		} else if (arg === null || arg === undefined) {
			if (color) {
				result_args.push(`${Cdim}${arg}${NCdim}`);
			} else {
				result_args.push(String(arg));
			}
		} else if (arg instanceof Error) {
			result_args.push(current_error_action(arg, color));
		} else {
			result_args.push(debug_commands.inspect(arg, color));
		}
	}

	let ret = '';
	while (result_messages.length || result_args.length) {
		const message = result_messages.shift();
		if (message) ret += message.replace('，', ', ');
		const arg = result_args.shift();
		if (arg) ret += arg;
	}

	return ret;
}

/**
 * TAG带颜色
 */
function write_line_colored_tag({ tag, writer, color }: IWriteLineOptions) {
	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		const head = `[${CSI}${color}m${tag}${Crst}]`;
		let body: string;
		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, true);
		} else {
			body = format_template(messages, args, true);
		}

		write(writer, head, body);
	};
}

/**
 * 整行带颜色
 */
function write_line_colored_line({ tag, writer, color }: IWriteLineOptions) {
	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		const head = `${CSI}${color}m[${tag}]`;
		let body: string;
		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, false);
		} else {
			body = format_template(messages, args, false);
		}
		body += Crst;

		write(writer, head, body);
	};
}

/**
 * 不带颜色
 */
function write_line_monolithic({ tag, level, writer }: IWriteLineOptions) {
	const lvlStr = logLevelPaddingStr[level];
	const head = `[${tag}/${lvlStr}]`;

	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		let body: string;

		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, false);
		} else {
			body = format_template(messages, args, false);
		}

		write(writer, head, body);
	};
}

function write(writer: ILineWriter, head: string, body: string) {
	if (body[0] === '[') {
		writer(`${head}${body}`);
	} else {
		writer(`${head} ${body}`);
	}
}
