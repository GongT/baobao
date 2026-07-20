import { globalObject } from '@idlebox/common';
import type { EnableLogLevel } from '../loglevels/loglevel.js';
import { create } from './create.logger.js';
import type { IInstrestedConsole, IMyLogger } from './types.js';

const symbol = Symbol.for('@idlebox/global-logger');

/**
 * 作为logger导出，必须在程序入口调用过 createGlobalLogger() 才能使用
 */
export let globalLogger: IMyLogger;

/**
 * 创建root-logger，随后logger变量可用
 */
export function createGlobalLogger(console: IInstrestedConsole, tag: string, defaultLevel: EnableLogLevel): void {
	globalLogger = globalObject[symbol];
	if (globalLogger) {
		globalLogger.error`全局日志对象已创建`;
		return;
	}

	globalLogger = create(console, tag);
	globalObject[symbol] = globalLogger;

	globalLogger.enable(defaultLevel);

	if (globalLogger.verbose.isEnabled) {
		globalLogger.verbose`verbose级别已启用`;
	} else {
		globalLogger.debug`debug级别已启用`;
	}
	return;
}
