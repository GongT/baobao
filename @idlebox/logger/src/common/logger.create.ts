import { EnableLogLevel } from '../loglevels/loglevel.js';
import { create } from './create.logger.js';
import { debug_enabled, defaultLogLevel } from './helpers.js';
import { globalLogger } from './logger.global.js';
import type { IInstrestedConsole, IMyLogger } from './types.js';

export interface ILoggerOptionsReq {
	readonly colors?: boolean;
	readonly console: IInstrestedConsole;
	readonly level?: EnableLogLevel;
}

/**
 * 创建一个新的logger实例
 * @param tag logger的tag，类似 "app:db:insert"
 * @param colors 是否启用颜色，默认启用
 * @returns
 */
export function createLoggerObject(tag: string, { colors = true, console, level }: ILoggerOptionsReq): IMyLogger {
	let logLevel = EnableLogLevel.error;
	if (level !== undefined) {
		logLevel = level;
	} else if (debug_enabled(tag)) {
		logLevel = defaultLogLevel;
	}

	const logger = create(console, tag, logLevel, colors);

	(globalLogger || logger).verbose`logger "${tag}" created, level = ${EnableLogLevel[logLevel]}`;

	return logger;
}
