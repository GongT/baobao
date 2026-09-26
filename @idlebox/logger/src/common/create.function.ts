import { defineInspectMethod } from '@idlebox/common';
import { call_debug_command, debug_commands, nodeFormat } from '../functions/builtin-commands.js';
import { Cdim, Crst, CSI, NCdim } from './ansi.js';
import { LogLevel, logLevelPaddingStr, logTagColor } from './colors.js';
import { current_error_action, escapeRegExp } from './helpers.js';
import type { ILineWriter, IMyDebugWithControl, InspectContext } from './types.js';

interface IDebugOptions {
	tag: string;
	level: LogLevel;
	colorEnabled: boolean;
	colorWholeLine?: boolean;
	writer: ILineWriter;
	enabled?: boolean;
}

export type IFormatter = (messages: TemplateStringsArray | string, ...args: unknown[]) => string;

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

	let format_line: IFormatter;
	if (!colorEnabled) {
		format_line = format_line_monolithic({
			...lineOpt,
			tag: tag ? tag : `$$`,
		});
	} else if (colorWholeLine) {
		format_line = format_line_colored_line(lineOpt);
	} else {
		format_line = format_line_colored_tag(lineOpt);
	}

	// assert.equal(typeof writer, 'function', 'writer must be a function');

	const r = Object.defineProperties(
		(m: any, ...args: unknown[]) => {
			if (!enabled) return;
			writer(format_line(m, ...args));
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
			format: {
				value: format_line,
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
function format_line_colored_tag({ tag, color }: IWriteLineOptions): IFormatter {
	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		const head = `[${CSI}${color}m${tag}${Crst}]`;
		let body: string;
		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, true);
		} else {
			body = format_template(messages, args, true);
		}

		return join_title_msg(head, body);
	};
}

/**
 * 整行带颜色
 */
function format_line_colored_line({ tag, color }: IWriteLineOptions): IFormatter {
	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		const head = `${CSI}${color}m[${tag}]`;
		let body: string;
		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, false);
		} else {
			body = format_template(messages, args, false);
		}
		body += Crst;

		return join_title_msg(head, body);
	};
}

/**
 * 不带颜色
 */
function format_line_monolithic({ tag, level }: IWriteLineOptions): IFormatter {
	const lvlStr = logLevelPaddingStr[level];
	const head = `[${tag}/${lvlStr}]`;

	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		let body: string;

		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, false);
		} else {
			body = format_template(messages, args, false);
		}

		return join_title_msg(head, body);
	};
}

function join_title_msg(head: string, body: string) {
	if (body[0] === '[') {
		return `${head}${body}`;
	} else {
		return `${head} ${body}`;
	}
}
