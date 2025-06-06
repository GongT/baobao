import { formatWithOptions, inspect, type InspectOptions } from 'util';
import { LogLevel, logLevelNames, logTagColor } from './colors.js';
import { color_enabled } from './helpers.js';
import type { IMyDebug, IMyDebugWithControl } from './types.js';

interface IDebugOptions {
	tag: string;
	level: LogLevel;
	color_enabled?: boolean;
	color_entire_line?: boolean;
	stream?: NodeJS.WritableStream;
	enabled?: boolean;
}
export function createDebug({
	tag,
	level,
	color_enabled: color_forced,
	color_entire_line = false,
	stream = process.stdout,
	enabled = true,
}: IDebugOptions): IMyDebugWithControl {
	const color = logTagColor[level];
	const lineOpt = {
		tag: tag ? tag : `${LogLevel[level]}`,
		stream,
		color,
		level,
	};
	const colors: boolean = typeof color_forced === 'undefined' ? color_enabled(lineOpt.stream) : color_forced;

	let write_line: IMyDebug;
	if (!colors) {
		write_line = write_line_monolithic(lineOpt);
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

const colorInspectOptions: InspectOptions = {
	depth: 3,
	compact: true,
	colors: true,
	maxArrayLength: 5,
	maxStringLength: 100,
};

/**
 * TAG带颜色
 */
function write_line_colored_tag({ tag, stream, color }: IWriteLineOptions) {
	return (messages: readonly string[] | string, ...args: unknown[]) => {
		stream.write(`[\x1b[${color}m${tag}\x1b[0m] `);
		if (typeof messages === 'string') {
			stream.write(formatWithOptions(colorInspectOptions, messages, ...args));
		} else {
			for (const message of messages) {
				stream.write(message);
				if (!args.length) continue;

				const arg = args.shift();
				if (
					typeof arg === 'string' ||
					typeof arg === 'number' ||
					typeof arg === 'boolean' ||
					typeof arg === 'bigint' ||
					typeof arg === 'symbol'
				) {
					stream.write(arg.toString());
				} else if (arg === null || arg === undefined) {
					stream.write(String(arg));
				} else {
					stream.write(inspect(arg, colorInspectOptions));
				}
			}
		}
		stream.write('\n');
	};
}

/**
 * 整行带颜色
 */
function write_line_colored_line({ tag, stream, color }: IWriteLineOptions) {
	return (messages: readonly string[] | string, ...args: unknown[]) => {
		stream.write(`\x1b[${color}m[${tag}] `);
		if (typeof messages === 'string') {
			stream.write(formatWithOptions(colorInspectOptions, messages, ...args));
		} else {
			for (const message of messages) {
				stream.write(message);
				if (!args.length) continue;

				const arg = args.shift();
				if (
					typeof arg === 'string' ||
					typeof arg === 'number' ||
					typeof arg === 'boolean' ||
					typeof arg === 'bigint' ||
					typeof arg === 'symbol'
				) {
					stream.write(arg.toString());
				} else if (arg === null || arg === undefined) {
					stream.write(String(arg));
				} else {
					stream.write(`${inspect(arg, colorInspectOptions)}\x1b[${color}m`);
				}
			}
		}
		stream.write('\x1b[0m\n');
	};
}

/**
 * 不带颜色
 */
function write_line_monolithic({ tag, level, stream }: IWriteLineOptions) {
	const inspectOptions: InspectOptions = {
		depth: 3,
		compact: true,
		colors: false,
		maxArrayLength: 5,
		maxStringLength: 100,
	};
	const lvlStr = logLevelNames[level];

	return (messages: readonly string[] | string, ...args: unknown[]) => {
		stream.write(`[${tag}:${lvlStr}] `);
		if (typeof messages === 'string') {
			stream.write(formatWithOptions(inspectOptions, messages, ...args));
		} else {
			for (const message of messages) {
				stream.write(message);
				const arg = args.shift();
				if (
					typeof arg === 'string' ||
					typeof arg === 'number' ||
					typeof arg === 'boolean' ||
					typeof arg === 'bigint' ||
					typeof arg === 'symbol'
				) {
					stream.write(arg.toString());
				} else if (arg === null || arg === undefined) {
					stream.write(String(arg));
				} else {
					stream.write(inspect(arg, inspectOptions));
				}
			}
		}
		stream.write('\n');
	};
}
