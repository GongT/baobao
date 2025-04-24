import { isAbsolute } from '../path/isAbsolute.js';
import { relativePath } from '../path/normalizePath.js';
import { globalObject } from '../platform/globalObject.js';
import { isNative } from '../platform/os.js';

const process = globalObject.process;
const window = globalObject.window;

const padding = /^(?<padding>\s*)at /.source;
const func_call = /(?<func_name>(?:async )?[^\/\\\s]+) (?:\[as (?<func_alias>[^\]]+)] )?/.source;
//                              [xxxx.yyyyy] [as eval]
const line_column = /(?::(?<line>\d+))?(?::(?<column>\d+))?/.source;
const locationEsm = /(?<schema>node:|file:\/\/|https?:\/\/)?(?<path2>[^:]+)/.source;
//                        node:internal/modules/cjs/loader.js:883:14
const locationCjs = /(?<path1>(?:\/|[a-zA-Z]:)[^:]+)/.source;
//                          /data/to/file.js
const location = `(?:${locationCjs}|${locationEsm})${line_column}`;

const regNormal = new RegExp(`${padding}${func_call}\\(${location}\\)$`);
type TypeMatchNormal = 'padding' | TypeMatchNoFile | TypeMatchFileOnly;

const regNoFile = new RegExp(`${padding}${func_call}$`);
type TypeMatchNoFile = 'padding' | 'func_name' | 'func_alias';

const regFileOnly = new RegExp(`${padding}${location}$`);
type TypeMatchFileOnly = 'padding' | 'schema' | 'path1' | 'path2' | 'line' | 'column';

const regEvalItem = new RegExp(`\\(eval at ${func_call}`, 'g');
const eval_source = /, (?<eval_func>[\S]+):(?<eval_line>\d+):(?<eval_column>\d+)/.source;
const regEval = new RegExp(`${padding}${func_call}.*?\\(${location}\\)+${eval_source}`);
type TypeMatchEval = 'padding' | TypeMatchNoFile | TypeMatchFileOnly | 'eval_func' | 'eval_line' | 'eval_column';

let root = process?.cwd?.() ?? window?.location?.domain ?? '/';
export function setErrorLogRoot(_root: string) {
	root = _root;
}

interface IFunction {
	name: string;
	alias?: string;
}
interface IFileLocation {
	path: string;
	schema: string; // '' | 'node:' | 'file:' | 'http:' | 'https:';
	line: number;
	column: number;
	isAbsolute: boolean;
}
interface IEvalDef {
	eval_func: string;
	eval_line: number;
	eval_column: number;
	funcs: string[];
}

export interface IStructreStackLine {
	invalid?: boolean;
	toString(): string;
	padding?: string;
	func?: IFunction;
	location?: IFileLocation;
	eval?: IEvalDef;
}

function matchLine<T extends string>(line: string, reg: RegExp): null | Record<T, string> {
	const m = reg.exec(line);
	if (!m) {
		return null;
	}
	return m.groups as any;
}
function addLoc(ret: IStructreStackLine, m: Record<TypeMatchFileOnly, string>) {
	const path = m.path1 || m.path2;
	ret.location = {
		schema: m.schema?.replace(/\/+$/, '') ?? '',
		path: path,
		line: Number.parseInt(m.line),
		column: Number.parseInt(m.column),
		isAbsolute: isAbsolute(path),
	};
}

function addFunc(ret: IStructreStackLine, m: Record<TypeMatchNoFile, string>) {
	ret.func = {
		name: m.func_name,
		alias: m.func_alias,
	};
}

export function parseStackLine(line: string): IStructreStackLine {
	const __raw = line;
	const ret: IStructreStackLine = {
		invalid: false,
		toString() {
			return __raw;
		},
	};
	Object.assign(ret, { __raw });
	const mNormal = matchLine<TypeMatchNormal>(line, regNormal);

	if (mNormal) {
		ret.padding = mNormal.padding;
		addFunc(ret, mNormal);
		addLoc(ret, mNormal);
		return ret;
	}

	const mFile = matchLine<TypeMatchFileOnly>(line, regFileOnly);
	if (mFile) {
		ret.padding = mFile.padding;
		addLoc(ret, mFile);
		return ret;
	}

	const mNoFile = matchLine<TypeMatchNoFile>(line, regNoFile);
	if (mNoFile) {
		ret.padding = mNoFile.padding;
		addFunc(ret, mNoFile);
		return ret;
	}

	const mEval = matchLine<TypeMatchEval>(line.replaceAll(regEvalItem, ''), regEval);
	if (mEval) {
		ret.padding = mEval.padding;
		addFunc(ret, mEval);
		addLoc(ret, mEval);

		ret.eval = {
			eval_column: Number.parseInt(mEval.eval_column),
			eval_func: mEval.eval_func,
			eval_line: Number.parseInt(mEval.eval_line),
			funcs: [],
		};
		for (const item of line.matchAll(regEvalItem)) {
			// biome-ignore lint/style/noNonNullAssertion: 有匹配必然有 groups
			ret.eval.funcs.push(item.groups!.func_name);
		}
		ret.eval.funcs.push(mEval.eval_func);

		return ret;
	}

	ret.invalid = true;
	return ret;
}

let notify_printed = false;
export function prettyPrintError(type: string, e: Error) {
	if (!e.stack || e.stack === e.message) {
		return console.error(e.message);
	}

	if (globalObject.DISABLE_PRETTY_ERROR || globalObject.process?.env?.DISABLE_PRETTY_ERROR) {
		console.error('[%s] %s', type, e.stack || e.message);
		return;
	}

	const columns = process?.stderr?.columns || 80;
	console.error(`${'-'.repeat(columns)}\n[${type}] ${prettyFormatError(e)}\n${'-'.repeat(columns)}`);

	if (!notify_printed && e.stack && e.message !== e.stack) {
		// console.log(JSON.stringify(e.stack), JSON.stringify(e.message));
		notify_printed = true;
		console.error(
			'\x1B[2muse env.DISABLE_PRETTY_ERROR=yes / window.DISABLE_PRETTY_ERROR=true to see original error stack\x1B[0m'
		);
	}
}

function red(s: string) {
	return isNative ? `\x1B[38;5;9m${s}\x1B[0m` : s;
}

export function prettyFormatStack(stackLines: readonly string[]) {
	const structured: IStructreStackLine[] = stackLines.map(parseStackLine);
	return structured
		.filter(skipSomeFrame)
		.map(translateFunction)
		.map((line) => {
			let ret;
			if (line.invalid) {
				return line.toString();
			}
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
					ret += formatFileLine(line.location.schema, line.location.path, line.location.line, line.location.column);
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
				if (fn_alias && fn_name && fn_name.startsWith('Object.')) {
					ret += `${fn_alias} [export]`;
				} else {
					ret += formatFunctionName(fn_name, fn_alias);
				}
				ret += '\x1b[0m';
				if (line.eval) {
					ret += `\x1b[2m(${line.eval.funcs.filter((e) => e !== '<anonymous>').join('->')})\x1b[0m`;
				}

				if (path) {
					let color;
					if (isNodeModule) {
						color = '\x1b[38;5;237m';
					} else {
						color = '\x1b[38;5;2m';
					}
					ret += ` (${color}`;
					const file = formatFileLine(line.location.schema, path, line.location.line, line.location.column);
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
		});
}

interface IError {
	readonly code?: any;
	readonly message?: any;
	readonly stack?: string;
}
export function prettyFormatError(e: IError, withMessage = true) {
	if (!e || !e.stack) {
		if (withMessage) {
			const msg = e?.message || 'Unknown Error';

			return red(`${msg}\n  No stack trace`);
		}
		return red('  No stack trace');
	}

	const stackLines = e.stack.split(/\n/g);

	let first = 'Unknown Error';
	if (/^\S/.test(stackLines[0])) {
		first = stackLines.shift()!;
	}

	if (withMessage) {
		if (e.code) {
			first = first.replace(/^(\S+):/, `$1(code ${e.code}):`);
		}

		return `${first}\n${prettyFormatStack(stackLines).join('\n')}`;
	}
	return prettyFormatStack(stackLines).join('\n');
}

let alert = false;
function formatFileLine(schema: string | undefined, file: string, row?: number, col?: number) {
	let rel = file;

	if (schema !== 'node:') {
		try {
			rel = relativePath(root, file);
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
		} catch (e: any) {
			if (!alert) {
				alert = true;
				console.error(
					'pretty print error: failed calc relative path ("%s" to "%s"):\n\x1B[2mFormat%s\x1B[0m',
					root,
					file,
					e.stack
				);
			}
			rel = file;
		}
	}

	return `${schema || ''}${rel}${row ? `:${row}` : ''}${col ? `:${col}` : ''}`;
}

function formatFunctionName(fn?: string, as?: string) {
	if (fn) {
		if (as) {
			return `${fn} [as ${as}]`;
		}
		return fn;
	}
	return '<anonymous>';
}

function translateFunction(data: IStructreStackLine): IStructreStackLine {
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
	return data;
}

/**
 *
 */
function skipSomeFrame({ location }: IStructreStackLine): boolean {
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
	return true;
}
