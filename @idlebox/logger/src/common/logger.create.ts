import process from 'node:process';
import { PassThrough } from 'node:stream';
import { create } from './create.js';
import { debug_enabled, defaultLogLevel } from './helpers.js';
import { terminal } from './logger.global.js';
import { EnableLogLevel, type IMyLogger } from './types.js';

/**
 * 创建一个新的logger实例
 * @param color_enabled 默认自动
 * @param pipeTo 默认是 process.stderr
 * @returns
 */
export function createLogger(
	tag: string,
	color_enabled: boolean | undefined = undefined,
	pipeTo: undefined | NodeJS.WritableStream = process.stderr,
): IMyLogger {
	const stream = new PassThrough();
	if (pipeTo) {
		Object.assign(stream, { isTTY: (pipeTo as any).isTTY });
		stream.pipe(pipeTo);
	}

	let level = EnableLogLevel.error;
	if (debug_enabled(tag)) {
		level = defaultLogLevel;
	}

	const logger = create(tag, color_enabled, stream, level);

	(terminal || logger).verbose`logger "${tag}" created, level = ${EnableLogLevel[level]}`;

	return logger;
}
