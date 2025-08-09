import { SoftwareDefectError } from '@idlebox/common';
import { LogLevel } from './colors.js';
import { createDebug } from './debug-fn.js';
import { defaultLogLevel, detectColorEnable } from './helpers.js';
import { EnableLogLevel, type IMyDebugWithControl, type IMyLogger } from './types.js';

const seen_loggers = new Set<string>();
export const all_logger_names: ReadonlySet<string> = seen_loggers;

export function create(tag: string, color_enabled: undefined | boolean, stream: NodeJS.ReadWriteStream, defaultLevel = EnableLogLevel.auto): IMyLogger {
	let currentLevel = defaultLevel;
	seen_loggers.add(tag);

	if (color_enabled === undefined) color_enabled = detectColorEnable(stream);

	const log_fatal = createDebug({ tag, color_enabled, level: LogLevel.fatal, stream, color_entire_line: true });

	const error = createDebug({ tag, color_enabled, level: LogLevel.error, stream });
	const success = createDebug({ tag, color_enabled, level: LogLevel.success, stream });
	const warn = createDebug({ tag, color_enabled, level: LogLevel.warn, stream });
	const info = createDebug({ tag, color_enabled, level: LogLevel.info, stream });
	const log = createDebug({ tag, color_enabled, level: LogLevel.log, stream });
	const debug = createDebug({ tag, color_enabled, level: LogLevel.debug, stream, color_entire_line: true });
	const verbose = createDebug({ tag, color_enabled, level: LogLevel.verbose, stream, color_entire_line: true });

	syncEnabled({ error, warn, info, log, success, debug, verbose }, tag, currentLevel);

	return {
		tag,
		stream,
		fatal: function fatal(messages, ...args) {
			log_fatal(messages as any, ...args);
			throw new SoftwareDefectError(`logger.fatal has been called`, fatal);
		},
		error,
		warn,
		info,
		log,
		success,
		debug,
		verbose,

		colorEnabled: color_enabled,

		enable(newMaxLevel: EnableLogLevel) {
			currentLevel = newMaxLevel;
			syncEnabled({ error, warn, info, log, success, debug, verbose }, tag, currentLevel);
		},

		extend: (newTag: string) => {
			if (tag) {
				return create(`${tag}:${newTag}`, color_enabled, stream, currentLevel);
			} else {
				return create(newTag, color_enabled, stream, currentLevel);
			}
		},
	};
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
		 *
		 * TODO !!
		 */
		+tag;
		currentLevel = defaultLogLevel;
	}

	// 手动控制（root-logger默认是手动控制）
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
