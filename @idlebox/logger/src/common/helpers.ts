import debug from 'debug';
import process from 'node:process';
import { terminal } from './logger.global.js';
import { EnableLogLevel } from './types.js';

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
		terminal.warn`invalid boolean string: ${value}, assuming false.`;
		return false;
	}
}

interface IWritableStream extends NodeJS.WritableStream {
	colorEnabled?: boolean;
	isTTY?: boolean;
}

function _colorEnabled(stream: IWritableStream): boolean {
	const colorArg = process.argv.find((e) => e.startsWith('--color=') || e === '--color' || e === '-c');
	const noColorArg = process.argv.includes('--no-color');

	// 命令行顶级优先
	if (colorArg) return true;
	if (noColorArg) return false;

	// 环境变量
	if (process.env.NO_COLOR || process.env.NODE_DISABLE_COLORS === '1') {
		/**
		 * https://force-color.org/
		 * https://nodejs.org/docs/latest/api/cli.html#node_disable_colors1
		 */
		return false;
	} else if (process.env.FORCE_COLOR) {
		return true;
	}

	// 检测其他可能
	if (stream.isTTY) {
		return true;
	}

	// TODO

	return false;
}

export function detectColorEnable(stream: IWritableStream = process.stderr): boolean {
	if (stream.colorEnabled === undefined) {
		stream.colorEnabled = _colorEnabled(stream);
	}
	return stream.colorEnabled;
}

export function escapeRegExp(str: string) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/**
 *
 * @param tag tag to match, e.g. "app:db:insert"
 * @returns a RegExp, eg. /(^|\s)(\\*|app:\\*|app:db:\\*|app:db:insert)($|\s)/
 */
export function compile_match_regex(tag: string, invert = false): RegExp {
	const parts = tag.split(':');
	parts.pop();

	let regs = ['\\*'];

	let comb = [];
	for (const part of parts) {
		comb.push(part);
		regs.push(`${escapeRegExp(comb.join(':'))}:\\*`);
	}
	regs.push(escapeRegExp(tag));
	return new RegExp(`(?:^|,)(${invert ? '-' : ''})(${regs.join('|')})(?:$|,)`, 'i');
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
	return debug(tag).enabled;
}

/**
 * 当指定tag开启时，应该输出它的什么级别
 * tag关闭时始终默认error
 *
 * 只有新创建的受此影响，且不影响root-logger，也不影响.extend
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
	// biome-ignore lint/performance/useTopLevelRegex:
	const has_debug_verbose = /(?<=^|,)(verbose|debug)(?=$|,)/;
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
			default:
				console.error('Invalid DEBUG_LEVEL: %s, using verbose.', process.env.DEBUG_LEVEL);
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
