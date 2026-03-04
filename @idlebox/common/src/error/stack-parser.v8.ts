import { isAbsolute } from '../path/isAbsolute.js';

const padding = /^(?<padding> {4})at /.source;
const func_call = /(?<func_name>(?:(?:async|new) )?[^/\\\s]+) (?:\[as (?<func_alias>[^\]]+)] )?/.source;
//                              xxxx.yyyyy [as eval]
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

const regInvalid = new RegExp(`${padding}(?<content>.+) \\(${location}\\)$`);
type TypeMatchInvalid = TypeMatchFileOnly | 'content';

export function parseStackString(stack: string) {
	return stack.split('\n').map(parseStackLine);
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
	special?: boolean;
	toString(): string;
	padding?: string;
	func?: IFunction;
	location?: IFileLocation;
	eval?: IEvalDef;
	_matches?: RegExp;
}

function matchLine<T extends string>(line: string, reg: RegExp): null | Record<T, string> {
	const m = reg.exec(line);
	if (!m) {
		return null;
	}
	return m.groups as any;
}
const endingSlashes = /\/+$/;
function addLoc(ret: IStructreStackLine, m: Record<TypeMatchFileOnly, string>) {
	const path = m.path1 || m.path2;
	ret.location = {
		schema: m.schema?.replace(endingSlashes, '') ?? '',
		path: path,
		line: Number.parseInt(m.line, 10),
		column: Number.parseInt(m.column, 10),
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
		ret._matches = regNormal;
		ret.padding = mNormal.padding;
		addFunc(ret, mNormal);
		addLoc(ret, mNormal);
		return ret;
	}

	const mFile = matchLine<TypeMatchFileOnly>(line, regFileOnly);
	if (mFile) {
		ret._matches = regFileOnly;
		ret.padding = mFile.padding;
		addLoc(ret, mFile);
		return ret;
	}

	const mNoFile = matchLine<TypeMatchNoFile>(line, regNoFile);
	if (mNoFile) {
		ret._matches = regNoFile;
		ret.padding = mNoFile.padding;
		addFunc(ret, mNoFile);
		return ret;
	}

	const mEval = matchLine<TypeMatchEval>(line.replaceAll(regEvalItem, ''), regEval);
	if (mEval) {
		ret._matches = regEval;
		ret.padding = mEval.padding;
		addFunc(ret, mEval);
		addLoc(ret, mEval);

		ret.eval = {
			eval_column: Number.parseInt(mEval.eval_column, 10),
			eval_func: mEval.eval_func,
			eval_line: Number.parseInt(mEval.eval_line, 10),
			funcs: [],
		};
		for (const item of line.matchAll(regEvalItem)) {
			// biome-ignore lint/style/noNonNullAssertion: 有匹配必然有 groups
			ret.eval.funcs.push(item.groups!['func_name']);
		}
		ret.eval.funcs.push(mEval.eval_func);

		return ret;
	}

	const mInv = matchLine<TypeMatchInvalid>(line, regInvalid);
	if (mInv) {
		const path = mInv.path1 || mInv.path2;
		if (path.endsWith(mInv.content)) {
			addLoc(ret, mInv);
			return ret;
		}
	}

	ret.invalid = true;
	return ret;
}
