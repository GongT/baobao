import { relativePath } from '../path/normalizePath.js';
import { globalObject } from '../platform/globalObject.js';
import { isNative, isNodeJs } from '../platform/os.js';
import { vscEscapeValue } from './pretty.vscode.js';
import { parseStackLine, type IStructreStackLine } from './stack-parser.v8.js';
import { createStackTraceHolder } from './stack-trace.js';

const process = globalObject.process;
const window = globalObject.window;

let errorRootPath = process?.cwd?.() ?? window?.location?.domain ?? '/';
export function setErrorLogRoot(_root: string) {
	if (process?.stderr?.write?.call && (process.env?.VSCODE_SHELL_INTEGRATION || process.env?.VSCODE_SHELL_INTEGRATION_SHELL_SCRIPT)) {
		process.stderr.write(`\x1B]633;P;Cwd=${vscEscapeValue(_root)}\x07`);
	}
	errorRootPath = _root;
}

function isPrettyDisabled() {
	return globalObject.DISABLE_PRETTY_ERROR || globalObject.process?.env?.DISABLE_PRETTY_ERROR;
}

function isSelfPrint() {
	return globalObject.PRETTY_ERROR_LOCATION || globalObject.process?.env?.PRETTY_ERROR_LOCATION;
}

let notify_printed = false;
export function prettyPrintError<ErrorType extends IError = IError>(type: string, e: ErrorType) {
	if (!e.stack || e.stack === e.message) {
		return console.error(e.message);
	}

	if (isPrettyDisabled()) {
		console.error('[%s] %s', type, e.stack || e.message);
		return;
	}

	const columns = process?.stderr?.columns || 80;
	const line = '-'.repeat(columns);
	console.error(line);

	console.error(`[${type}] ${prettyFormatError(e, true, false)}`);

	let cause = e.cause;
	while (cause && typeof cause === 'object' && 'stack' in cause) {
		console.error(`[Caused by] ${prettyFormatError(cause as IError, true, false)}`);
		cause = (cause as IError).cause;
	}

	if (isSelfPrint()) {
		const structured = [];
		structured.push({
			special: true,
			toString() {
				return '== 以上错误输出于:';
			},
		});

		const selfStack = createStackTraceHolder('111', prettyPrintError);
		const stackLines = selfStack.stack.split(/\n/g).slice(1);
		structured.push(...stackLines.map(parseStackLine));

		const formatter = new Formatter();
		const txt = structured.filter(formatter.skipSomeFrame).map(formatter.translateFunction).map(formatter.stringifyLine).join('\n');
		console.error(txt.trim() || '**无有效栈信息，无法定位输出位置**');
	}

	console.error(line);

	if (!notify_printed && e.stack && e.message !== e.stack) {
		// console.log(JSON.stringify(e.stack), JSON.stringify(e.message));
		notify_printed = true;
		console.error(notifyMessage);
	}
}

const notifyMessage = isNodeJs
	? '\x1B[2m设置环境变量 DISABLE_PRETTY_ERROR=yes 绕过格式化, 使用 PRETTY_ERROR_LOCATION 查看输出位置\x1B[0m'
	: '设置全局变量 window.DISABLE_PRETTY_ERROR=true 绕过格式化';

function red(s: string) {
	return isNative ? `\x1B[38;5;9m${s}\x1B[0m` : s;
}

function unparsedLine(line: string) {
	return `\x1B[48;5;9m${line}\x1B[0m`;
}

/**
 * 格式化栈信息为可读的字符串数组
 * @param stackLines 栈信息行数组，不能包含.stack的第一行
 * @param boundary 边界函数，默认为 prettyFormatStack 本身
 * @returns 格式化后的栈信息数组
 */
export function prettyFormatStack(stackLines: readonly string[]): string[];
export function prettyFormatStack(stackLines: readonly string[], boundary: CallableFunction | false): string[];
export function prettyFormatStack(stackLines: readonly string[], boundary: CallableFunction | false = prettyFormatStack): string[] {
	if (isPrettyDisabled()) {
		return stackLines.slice();
	}
	const structured: IStructreStackLine[] = stackLines.map(parseStackLine);

	if (boundary && isSelfPrint()) {
		structured.push({
			special: true,
			toString() {
				return '== 以上错误格式化于:';
			},
		});

		const selfStack = createStackTraceHolder('111', boundary);
		const stackLines = selfStack.stack.split(/\n/g).slice(1);
		structured.push(...stackLines.map(parseStackLine));
	}

	const formatter = new Formatter();
	return structured.filter(formatter.skipSomeFrame).map(formatter.translateFunction).map(formatter.stringifyLine);
}

interface IError {
	readonly code?: any;
	readonly message?: any;
	readonly stack?: string;

	readonly cause?: unknown;
}

const regStartsNotEmpty = /^\S/;
const regErrorClassName = /^(\S+):/;

/**
 * 格式化错误对象为可读的字符串，
 *
 * @param e 要格式化的错误对象
 * @param withMessage 是否包含错误信息（即第一行），默认为 true
 * @param boundary 可选的边界函数，用于确定哪些栈帧应该被包含在格式化结果中，默认为 prettyFormatError 本身
 * @returns 格式化后的错误字符串
 */
export function prettyFormatError<ErrorType extends IError = IError>(e: ErrorType, withMessage?: boolean): string;
export function prettyFormatError<ErrorType extends IError = IError>(e: ErrorType, withMessage?: boolean, boundary?: CallableFunction | false): string;
export function prettyFormatError<ErrorType extends IError = IError>(e: ErrorType, withMessage = true, boundary: CallableFunction | false = prettyFormatError) {
	if (!e?.stack) {
		if (withMessage) {
			const msg = e?.message || '#未知异常';

			return red(`${msg}\n  **无法格式化错误对象，不包含 message 和 stack 属性**`);
		}
		return red('  **无法格式化错误对象，不包含 message 和 stack 属性**');
	}

	if (isPrettyDisabled()) {
		return e.stack;
	}

	const stackLines = e.stack.split(/\n/g);

	let first = '#未知错误';
	if (regStartsNotEmpty.test(stackLines[0])) {
		first = stackLines.shift() as string;
	}

	if (withMessage) {
		if (e.code) {
			// 给错误类名添加 code: "Error: xxx" -> "Error(code E_EXISTS): xxx"
			first = first.replace(regErrorClassName, `$1(code ${e.code}):`);
		}

		return `${first}\n${prettyFormatStack(stackLines, boundary).join('\n')}`;
	}
	return prettyFormatStack(stackLines, boundary).join('\n');
}

class Formatter {
	private messageEnded = false;

	constructor() {
		this.stringifyLine = this.stringifyLine.bind(this);
		this.translateFunction = this.translateFunction.bind(this);
		this.skipSomeFrame = this.skipSomeFrame.bind(this);
	}

	private formatFileLine(schema: string | undefined, file: string, row?: number, col?: number) {
		let rel = file;

		if (schema !== 'node:') {
			try {
				rel = relativePath(errorRootPath, file);
				if (rel[0] !== '.') {
					rel = `./${rel}`;
				} else if (rel[1] === '.') {
					if (file.length < rel.length) {
						rel = file;
					}
				}
				if (rel[0] === '.') {
					schema = '';
				}
			} catch {
				// if (!alert) {
				// 	alert = true;
				// 	console.error('pretty print failed parse line: \n\x1B[2mFormat%s\x1B[0m', e.stack);
				// }
				rel = file;
			}
		}

		return `${schema || ''}${rel}${row ? `:${row}` : ''}${col ? `:${col}` : ''}`;
	}

	private formatFunctionName(fn?: string, as?: string) {
		if (fn) {
			if (as) {
				return `${fn} [as ${as}]`;
			}
			return fn;
		}
		return '<anonymous>';
	}

	stringifyLine(line: IStructreStackLine) {
		let ret: string;
		if (line.special) {
			return line.toString();
		}
		if (line.invalid) {
			if (this.messageEnded) {
				return unparsedLine(line.toString().trim());
			}
			return line.toString();
		}
		this.messageEnded = true;
		const fn_name = line.func?.name;

		if (!line.location?.isAbsolute || line.location.schema === 'node:') {
			// no-path, relative path, node:
			ret = '  at \x1B[2m';
			if (line.func) {
				ret += fn_name;
				if (line.func.alias) {
					ret += ` [${line.func.alias}]`;
				}
			}

			if (line.location?.path === '<anonymous>') {
			} else if (line.location?.path) {
				if (fn_name) {
					ret += ' (';
				}
				ret += this.formatFileLine(line.location.schema, line.location.path, line.location.line, line.location.column);
				if (fn_name) {
					ret += ')';
				}
			}
			ret += '\x1B[0m';
		} else {
			const path = line.location.path;
			const isNodeModule = path.includes('/node_modules/');
			const fn_alias = line.func?.alias;

			const color = fn_name ? (isNodeModule ? '14;2' : '14') : '8';
			ret = `\x1b[0m  at \x1b[38;5;${color}m`;
			if (fn_alias && fn_name?.startsWith('Object.')) {
				ret += `${fn_alias} [export]`;
			} else {
				ret += this.formatFunctionName(fn_name, fn_alias);
			}
			ret += '\x1b[0m';
			if (line.eval) {
				ret += `\x1b[2m(${line.eval.funcs.filter((e) => e !== '<anonymous>').join('->')})\x1b[0m`;
			}

			if (path) {
				let color: string;
				if (isNodeModule) {
					color = '\x1b[38;5;237m';
				} else {
					color = '\x1b[38;5;2m';
				}
				ret += ` (${color}`;
				const file = this.formatFileLine(line.location.schema, path, line.location.line, line.location.column);
				const lastNmPos = file.lastIndexOf('/node_modules/');
				if (lastNmPos >= 0) {
					ret += file.slice(0, lastNmPos + 14);

					let nextSlash = file.indexOf('/', lastNmPos + 15);
					const scopePkg = file[lastNmPos + 14] === '@';
					if (scopePkg) {
						nextSlash = file.indexOf('/', nextSlash + 1);
					}

					ret += '\x1B[0m';
					ret += file.slice(lastNmPos + 14, nextSlash);
					ret += color;
					ret += file.slice(nextSlash);
				} else {
					ret += file;
				}
				ret += '\x1B[0m)';
			}
		}
		return ret;
	}

	translateFunction(data: IStructreStackLine): IStructreStackLine {
		if (!data.func?.name) {
			return data;
		}
		if (data.func.name === 'Timeout._onTimeout') {
			data.func.name = 'setTimeout';
		}
		if (data.func.name === 'Immediate._onImmediate') {
			data.func.name = 'setImmediate';
		}
		if (data.func.name === 'process.processTicksAndRejections') {
			data.func.name = 'process.nextTick';
		}
		if (data.func.name.startsWith('Timeout.') && data.func.alias === '_onTimeout') {
			data.func.name = `setTimeout->${data.func.name.slice(8)}`;
			data.func.alias = undefined;
		}
		if (data.func.name.startsWith('async Promise.all')) {
			data.func.name = `Promise.all()`;
			data.func.alias = data.location?.path;
			data.location = undefined;
		}
		return data;
	}

	/**
	 *
	 */
	skipSomeFrame({ func, location }: IStructreStackLine): boolean {
		if (!location?.path) {
			return true;
		}

		if (location.schema === 'node:') {
			if (location.path.startsWith('internal/timers')) {
				return false;
			}
			if (location.path === 'internal/modules/cjs/loader') {
				return false;
			}
			if (location.path === 'internal/modules/esm/loader') {
				return false;
			}
			if (location.path === 'internal/modules/run_main') {
				return false;
			}
			if (location.path === 'internal/modules/esm/module_job') {
				return false;
			}
		}
		if (!location.path.includes('/')) {
			if (location.path.startsWith('_stream_')) {
				return false;
			}
		}
		if (location.path === '<anonymous>') {
			// new Promise ('<anonymous>')
			if (func?.name === 'new Promise') {
				return false;
			}
			if (func?.name === 'new Function') {
				return false;
			}
		}
		return true;
	}
}
