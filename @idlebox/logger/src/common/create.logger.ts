import { defineInspectMethod, SoftwareDefectError } from '@idlebox/common';
import type { InspectContext } from 'node:util';
import { EnableLogLevel } from '../loglevels/loglevel.js';
import { LogLevel } from './colors.js';
import { createDebug } from './create.function.js';
import { defaultLogLevel } from './helpers.js';
import { loggersRegistry, loggersRegistrySet } from './registry.js';
import type { IInstrestedConsole, IMyDebugWithControl, IMyLogger } from './types.js';

export function create(console: IInstrestedConsole, tag: string, defaultLevel = EnableLogLevel.auto, color_enabled: boolean = true): IMyLogger {
	const exists = loggersRegistry?.get(tag);
	if (exists) return exists;

	const colorEnabled = color_enabled && console.colorEnabled;
	let currentLevel = defaultLevel;

	const log_fatal = createDebug({ tag, colorEnabled, level: LogLevel.fatal, writer: console.error, colorWholeLine: true });

	const error = createDebug({ tag, colorEnabled, level: LogLevel.error, writer: console.error });
	const success = createDebug({ tag, colorEnabled, level: LogLevel.success, writer: console.log });
	const warn = createDebug({ tag, colorEnabled, level: LogLevel.warn, writer: console.warn });
	const info = createDebug({ tag, colorEnabled, level: LogLevel.info, writer: console.info });
	const log = createDebug({ tag, colorEnabled, level: LogLevel.log, writer: console.log });
	const debug = createDebug({ tag, colorEnabled, level: LogLevel.debug, writer: console.debug, colorWholeLine: true });
	const verbose = createDebug({ tag, colorEnabled, level: LogLevel.verbose, writer: console.debug, colorWholeLine: true });

	syncEnabled({ error, warn, info, log, success, debug, verbose }, tag, currentLevel);

	function fatal(messages: string | TemplateStringsArray, ...args: any[]): never {
		log_fatal(messages as any, ...args);
		throw new SoftwareDefectError(`logger.fatal has been called`, { boundary: fatal });
	}

	const result = {
		tag,
		console,
		fatal,
		error,
		warn,
		info,
		log,
		success,
		debug,
		verbose,

		colorEnabled: colorEnabled,

		enable(newLevel: EnableLogLevel) {
			currentLevel = newLevel;
			syncEnabled({ error, warn, info, log, success, debug, verbose }, tag, currentLevel);
		},

		extend: (newTag: string) => {
			if (tag) {
				return create(console, `${tag}:${newTag}`, currentLevel, colorEnabled);
			} else {
				return create(console, newTag, currentLevel, colorEnabled);
			}
		},
	};

	loggersRegistrySet(result);

	return defineInspectMethod(result, (_depth: number, context: InspectContext) => {
		if (_depth < 0) return `${context.stylize(`[Logger ${tag}]`, 'special')}`;
		return `${context.stylize('Logger', 'name')} { "${context.stylize(tag, 'string')}" ${context.stylize(EnableLogLevel[currentLevel], 'undefined')} }`;
	});
}

interface IPass {
	error: IMyDebugWithControl;
	success: IMyDebugWithControl;
	warn: IMyDebugWithControl;
	info: IMyDebugWithControl;
	log: IMyDebugWithControl;
	debug: IMyDebugWithControl;
	verbose: IMyDebugWithControl;
}
function syncEnabled(opt: IPass, tag: string, currentLevel: EnableLogLevel) {
	if (currentLevel === EnableLogLevel.auto) {
		/**
		 * 如果自动探测，如何认定一个log启用
		 * - fatal永远启用
		 * - tag为空时，认为DEBUG中存在tag
		 * - 如果DEBUG中存在-tag:$level，则禁用 tag:$level 单个级别
		 * - 如果DEBUG中存在tag
		 *        - 如果有DEBUG_LEVEL，则启用 >=DEBUG_LEVEL 级别
		 *        - 否则启用 >log 级别
		 *    否则启用 >warn 级别
		 * - 如果DEBUG中存在tag:$level，则启用 tag:$level 单个级别
		 */
		+tag;
		currentLevel = defaultLogLevel;
	}

	/** 手动控制 */

	for (const i of [opt.error, opt.warn, opt.info, opt.log, opt.success, opt.debug, opt.verbose]) {
		i.enable();
	}
	if (currentLevel < EnableLogLevel.error) {
		opt.error.disable();
		opt.success.disable();
	}
	if (currentLevel < EnableLogLevel.warn) {
		opt.warn.disable();
	}
	if (currentLevel < EnableLogLevel.info) {
		opt.info.disable();
	}
	if (currentLevel < EnableLogLevel.log) {
		opt.log.disable();
	}
	if (currentLevel < EnableLogLevel.debug) {
		opt.debug.disable();
	}
	if (currentLevel < EnableLogLevel.verbose) {
		opt.verbose.disable();
	}
}
