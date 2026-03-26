import { prettyFormatError } from '@idlebox/common';
import debug from 'debug';
import { debug_commands } from '../functions/builtin-commands.js';
import { EnableLogLevel } from '../loglevels/loglevel.js';
import { globalLogger } from './logger.global.js';
import type { IDebugCommand } from './types.js';

/**
 * 判断 字符串是否为“真值”
 *  * 1 / 0
 *  * true / false
 *  * on / off
 *  * yes / no
 *  * enabled / disabled
 *
 * 其他内容会导致一个警告，并返回 false
 */
export function is_string_truthy(value: string | undefined) {
	if (!value) return false;

	value = value.toLowerCase();
	if (value === '1' || value === 'true' || value === 'on' || value === 'yes' || value === 'enabled') {
		return true;
	} else if (value === '0' || value === 'false' || value === 'off' || value === 'no' || value === 'disabled') {
		return false;
	} else {
		globalLogger.warn`invalid boolean string: ${value}, assuming false.`;
		return false;
	}
}

export function escapeRegExp(str: string) {
	return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

/**
 *
 * @param tag tag to match, e.g. "app:db:insert"
 * @returns a RegExp, eg. /(^|\s)(\\*|app:\\*|app:db:\\*|app:db:insert)($|\s)/
 */
export function compile_match_regex(tag: string, invert = false): RegExp {
	const parts = tag.split(':');
	parts.pop();

	const regs = ['\\*'];

	const comb = [];
	for (const part of parts) {
		comb.push(part);
		regs.push(`${escapeRegExp(comb.join(':'))}:\\*`);
	}
	regs.push(escapeRegExp(tag));
	return new RegExp(`(?:^| )(${invert ? '-' : ''})(${regs.join('|')})(?:$| )`, 'i');
}

/**
 * 从字符串中匹配指定的tag是否启用，不完全模拟 debug 模块的功能，不处理反义匹配（需用match_disabled）
 * @param tag 类似 "app:db:insert" 的tag
 * @param env 环境变量内容，默认 process.env.DEBUG
 * @returns 冒号数量
 */
export function match_enabled(tag: string, env = process.env.DEBUG || ''): number {
	const tagReg = compile_match_regex(tag);
	const m = tagReg.exec(env);
	if (!m) return 0;
	return m[0].split(':').length;
}

/**
 * 从字符串中匹配指定的tag是否禁用，不完全模拟 debug 模块的功能，tag前面不要加-
 * @param tag 类似 "app:db:insert" 的tag
 * @param env 环境变量内容，默认 process.env.DEBUG
 * @returns 冒号数量 - 1
 */
export function match_disabled(tag: string, env = process.env.DEBUG || ''): number {
	const tagReg = compile_match_regex(tag, true);
	const m = tagReg.exec(env);
	if (!m) return -1;
	return m[0].split(':').length - 1;
}

/**
 * 调用debug模块的debug.enabled方法
 */
export function debug_enabled(tag: string) {
	if (!tag) return true;
	return debug(tag).enabled;
}

/**
 * [当指定tag开启时] 应该输出它的什么级别
 */
export let defaultLogLevel = (() => {
	if (process.argv.includes('--verbose')) {
		// 参数中含有 --verbose 时，设置默认日志级别
		return EnableLogLevel.verbose;
	} else {
		// 参数中含有 --debug 或 -d 时，设置默认日志级别
		const dbgCnt = process.argv.filter((e) => e === '--debug' || e === '-d').length;
		const dbgCnt2 = process.argv.filter((e) => e === '-dd').length > 0;
		if (dbgCnt > 1 || dbgCnt2) {
			return EnableLogLevel.verbose;
		} else if (dbgCnt === 1) {
			return EnableLogLevel.debug;
		}
	}

	// DEBUG=xxx,verbose,xxx
	// biome-ignore lint/performance/useTopLevelRegex: a
	const has_debug_verbose = /(?<=^| |,)(verbose|debug)(?=$| |,)/;
	const setted = has_debug_verbose.exec(process.env.DEBUG || '');
	if (setted) {
		if (setted[0] === 'verbose') {
			return EnableLogLevel.verbose;
		} else {
			return EnableLogLevel.debug;
		}
	} else {
		// 直接通过 DEBUG_LEVEL 设置
		switch (process.env.DEBUG_LEVEL || '') {
			case '':
				return EnableLogLevel.log;
			case 'verbose':
				return EnableLogLevel.verbose;
			case 'debug':
				return EnableLogLevel.debug;
			case 'info':
				return EnableLogLevel.info;
			case 'warn':
				return EnableLogLevel.warn;
			case 'error':
				return EnableLogLevel.error;
			default:
				console.error('Invalid DEBUG_LEVEL: %s (allow: "", verbose, debug, info, warn, error), using verbose.', process.env.DEBUG_LEVEL);
				return EnableLogLevel.verbose;
		}
	}
})();

/**
 * 手动设置默认日志级别
 * root-logger 和 已经创建的 不受此影响
 */
export function set_default_log_level(level: EnableLogLevel) {
	defaultLogLevel = level;
}

type ErrorAction = 'stack' | 'message' | 'stack-pretty' | 'inspect' | IDebugCommand;
const actions = {
	stack(e: Error, _color: boolean) {
		return e.stack || e.message || e?.toString() || '*unknown error*';
	},
	message(e: Error, _color: boolean) {
		return e.message || e?.toString() || '*unknown error*';
	},
	['stack-pretty']: (e: Error, _color: boolean) => {
		return prettyFormatError(e);
	},
};
export let current_error_action = actions.stack;
export function set_error_action(action: ErrorAction) {
	switch (action) {
		case 'stack':
		case 'message':
		case 'stack-pretty':
			current_error_action = actions[action];
			break;
		case 'inspect':
			current_error_action = debug_commands.inspect;
			break;
		default:
			current_error_action = action;
			break;
	}
}
