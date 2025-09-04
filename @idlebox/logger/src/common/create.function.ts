import { Cdim, Crst, CSI, NCdim } from './ansi.js';
import { LogLevel, logLevelPaddingStr, logTagColor } from './colors.js';
import { call_debug_command, debug_commands, nodeFormat } from './debug.commands.js';
import { current_error_action } from './helpers.js';
import type { IMyDebug, IMyDebugWithControl } from './types.js';

interface IDebugOptions {
	tag: string;
	level: LogLevel;
	color_enabled: boolean;
	color_entire_line?: boolean;
	stream?: NodeJS.WritableStream;
	enabled?: boolean;
}
export function createDebug({ tag, level, color_enabled, color_entire_line = false, stream = process.stdout, enabled = true }: IDebugOptions): IMyDebugWithControl {
	const color = logTagColor[level];
	const lineOpt = {
		tag: tag ? tag : `${LogLevel[level][0].toUpperCase()}`,
		stream,
		color,
		level,
	};

	let write_line: IMyDebug;
	if (!color_enabled) {
		write_line = write_line_monolithic({
			...lineOpt,
			tag: tag ? tag : `$$`,
		});
	} else if (color_entire_line) {
		write_line = write_line_colored_line(lineOpt);
	} else {
		write_line = write_line_colored_tag(lineOpt);
	}

	const r = Object.assign(
		(m: any, ...args: unknown[]) => {
			if (!r.isEnabled) return;
			write_line(m, ...args);
		},
		{
			enable: () => {
				r.isEnabled = true;
			},
			disable: () => {
				r.isEnabled = false;
			},
			isEnabled: enabled,
		},
	);

	return r;
}

interface IWriteLineOptions {
	tag: string;
	stream: NodeJS.WritableStream;
	color: string;
	level: LogLevel;
}

const lastWordReg = /\b[a-z_]+<$/i;

function format_template(messages: TemplateStringsArray, args: unknown[], color: boolean) {
	const result_messages: string[] = messages.slice();
	const result_args: string[] = [];
	for (const [index, arg] of args.entries()) {
		const prefix = result_messages[index] || '';
		const postfix = result_messages[index + 1] || '';

		if (prefix.at(-1) === '<' && postfix[0] === '>') {
			const lastWord = lastWordReg.exec(prefix);
			if (lastWord) {
				const command = prefix.slice(lastWord.index, -1);
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
		if (message) ret += message;
		const arg = result_args.shift();
		if (arg) ret += arg;
	}

	return ret;
}

/**
 * TAG带颜色
 */
function write_line_colored_tag({ tag, stream, color }: IWriteLineOptions) {
	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		const head = `[${CSI}${color}m${tag}${Crst}]`;
		let body: string;
		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, true);
		} else {
			body = format_template(messages, args, true);
		}

		write(stream, head, body);
	};
}

/**
 * 整行带颜色
 */
function write_line_colored_line({ tag, stream, color }: IWriteLineOptions) {
	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		const head = `${CSI}${color}m[${tag}]`;
		let body: string;
		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, false);
		} else {
			body = format_template(messages, args, false);
		}
		body += Crst;

		write(stream, head, body);
	};
}

/**
 * 不带颜色
 */
function write_line_monolithic({ tag, level, stream }: IWriteLineOptions) {
	const lvlStr = logLevelPaddingStr[level];
	const head = `[${tag}/${lvlStr}]`;

	return (messages: TemplateStringsArray | string, ...args: unknown[]) => {
		let body: string;

		if (typeof messages === 'string') {
			body = nodeFormat(messages, args, false);
		} else {
			body = format_template(messages, args, false);
		}

		write(stream, head, body);
	};
}

function write(stream: NodeJS.WritableStream, head: string, body: string) {
	if (body[0] === '[') {
		stream.write(`${head}${body}\n`);
	} else {
		stream.write(`${head} ${body}\n`);
	}
}
