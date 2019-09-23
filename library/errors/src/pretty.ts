import { isAbsolute } from 'path';

const regNormal = /^\s+at ([^\/\s]+)(?: \[as ([^\]]+)])? \(([^:]+)(:\d+)?(:\d+)\)$/;

const enum regNormalMatch {
	fn = 1,
	fnAlias,
	file,
	row,
	column
}

const regFunctionOnly = /^\s+at ([^\/\\\s]+(?: \[as ([^\]]+)])?)$/;

const enum regFunctionMatch {
	fn = 1,
	fnAlias,
}

const regFileOnly = /^\s+at ([^:]+)(:\d+)?(:\d+)$/;

const enum regFileOnlyMatch {
	file = 1,
	row,
	column
}

let root = __dirname;

export function setErrorLogRoot(_root: string) {
	root = _root;
}

interface IInternalData {
	fn?: string;
	as?: string;
	file?: string;
	line?: number;
	col?: number;
	abs?: boolean;
}

export function prettyPrintError(type: string, e: Error) {
	console.error(`------------------------------------------
[${type}] ${prettyFormatError(e)}`);
}

function red(s: string) {
	return `\x1B[38;5;9m${s}\x1B[0m`;
}

export function prettyFormatError(e: Error) {
	if (!e || !e.message) {
		return red('Unknown Error');
	}
	if (!e.stack) {
		return red(e.message + '\nNo stack trace');
	}
	const stackStr = e.stack.split(/\n/g);
	let first = stackStr.shift()!;
	const stack: IInternalData[] = stackStr.map((line) => {
		if (regNormal.test(line)) {
			const m = regNormal.exec(line)!;
			return {
				fn: m[regNormalMatch.fn],
				as: m[regNormalMatch.fnAlias],
				file: m[regNormalMatch.file],
				line: parseInt(m[regNormalMatch.row].slice(1)),
				col: parseInt(m[regNormalMatch.column].slice(1)),
				abs: isAbsolute(m[regNormalMatch.file]),
			};
		} else if (regFunctionOnly.test(line)) {
			const m = regFunctionOnly.exec(line)!;
			return {
				fn: m[regFunctionMatch.fn],
				as: m[regFunctionMatch.fnAlias],
				file: undefined,
				line: undefined,
				col: undefined,
				abs: false,
			};
		} else if (regFileOnly.test(line)) {
			const m = regFileOnly.exec(line)!;
			return {
				fn: undefined,
				as: undefined,
				file: m[regFileOnlyMatch.file],
				line: parseInt(m[regFileOnlyMatch.row].slice(1)),
				col: parseInt(m[regFileOnlyMatch.column].slice(1)),
				abs: isAbsolute(m[regFileOnlyMatch.file]),
			};
		} else {
			console.error('cannot parse error stack trace line:\n\t"%s"', line);
			return { fn: line };
		}
	});
	const stackOutput = stack.filter(ignoreSomeFiles).map(translateFunction).map(({ fn, file, as, abs, line, col }) => {
		let ret;

		if (abs) {
			ret = '  at \x1b[38;5;6m';
			if (as && fn && fn.startsWith('Object.')) {
				ret += as + ' [export]';
			} else {
				ret += formatFunctionName(fn, as);
			}
			ret += '\x1b[0m';
			if (file) {
				ret += ' (' + formatFileLine(file.replace(root, '.'), line, col) + ')\x1B[0m';
			}
		} else {
			ret = '\x1B[2m  at ';
			if (fn) {
				ret += fn;
			}
			if (file) {
				if (fn) {
					ret += ' (';
				}
				ret += formatFileLine(file.replace(root, '.'), line, col);
				if (fn) {
					ret += ')';
				}
			}
			ret += '\x1B[0m';
		}
		return ret;
	});

	if ((e as any).code) {
		first = first.replace(/^(\S+):/, (_, name) => {
			return `${name}(code ${(e as any).code}):`;
		});
	}

	return first + '\n' + stackOutput.join('\n');
}

function formatFileLine(file: string, row?: number, col?: number) {
	return `${file}${row ? `:${row}` : ''}${col ? `:${col}` : ''}`;
}

function formatFunctionName(fn?: string, as?: string) {
	if (fn) {
		if (as) {
			return `${fn} [as ${as}]`;
		} else {
			return fn;
		}
	} else {
		return '*unknown function*';
	}
}

function translateFunction(data: IInternalData): IInternalData {
	if (!data.fn) {
		return data;
	}
	if (data.fn === 'Timeout._onTimeout') {
		data.fn = 'setTimeout';
	}
	if (data.fn.startsWith('Timeout.') && data.as === '_onTimeout') {
		data.fn = 'setTimeout->' + data.fn.slice(8);
		delete data.as;
	}
	return data;
}

function ignoreSomeFiles({ file }: IInternalData): boolean {
	if (file === 'internal/timers.js') {
		return false;
	}
	if (file === 'internal/modules/cjs/loader.js') {
		return false;
	}
	if (!file) {
		return true;
	}
	return true;
}
