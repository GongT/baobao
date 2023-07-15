/**
 * load json and all it's inheritance
 *
 * for example `tsconfig.json`
 *
 * @see example ./test.js
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import { assign, CommentArray, parse } from 'comment-json';
import deepmerge, { Options } from 'deepmerge';
import { del as delPath, get as getPath } from 'object-path';

export function readJsonFile(filePath: string): any {
	return parse(readFileSync(filePath, 'utf-8'));
}

interface IProcess {
	(file: string, data: any): void;
}

function localResolve(object: any, key: number | string, currentFile: string) {
	object[key] = resolve(currentFile, '..', object[key]);
}

function tsconfigParser(file: string, tsconfig: any) {
	for (const key of ['outDir', 'rootDir', 'tsBuildInfoFile']) {
		if (!tsconfig.compilerOptions[key]) continue;
		localResolve(tsconfig.compilerOptions, key, file);
	}
	for (const key of ['typeRoots']) {
		const arr = tsconfig.compilerOptions[key];
		if (!arr) continue;
		for (let index = 0; index < arr.length; index++) {
			localResolve(arr, index, file);
		}
	}
}
export const tsconfigReader = createDynamicReader(tsconfigParser);

export function createDynamicReader(processor: IProcess) {
	return function wrappedReadJsonFile(filePath: string) {
		const ret = readJsonFile(filePath);
		processor(filePath, ret);
		return ret;
	};
}

interface IReadFile {
	(file: string): any;
}
interface IResolver {
	(current: string, id: string): string;
}

/**
 */
export interface ILoadJsonOptions {
	readJsonFile: IReadFile;
	cwd?: string;

	/**
	 * which field specify inherit target
	 * @default "extends"
	 */
	extendsField: string;

	/**
	 * should node_modules been used for resolve (if false, only filesystem relative path is allowed)
	 * @default true
	 */
	nodeResolution: boolean;

	/**
	 * controls how to merge array
	 * @default override
	 * @see  https://www.npmjs.com/package/deepmerge
	 */
	arrayMerge: Options['arrayMerge'];
}
const defaultOptions: ILoadJsonOptions = {
	readJsonFile,
	extendsField: 'extends',
	nodeResolution: true,
	arrayMerge: overwriteMerge,
};

export class NotFoundError extends Error {
	constructor(public readonly file: string, public readonly source: string) {
		super(`missing file: ${file}\n  from: ${source}`);
	}
}

export function loadInheritedJson(file: string, options: Partial<ILoadJsonOptions> = {}): any {
	const o = deepmerge.all<ILoadJsonOptions>([{}, defaultOptions, options]);

	const resolve: IResolver = o.nodeResolution ? nodeResolution : resolveFilesystem;

	const datas: any[] = [];
	let lastFile = o.cwd || process.cwd();
	let extend = file;
	while (extend) {
		// console.error('load extend:', extend);

		const next = resolve(lastFile, extend);
		extend = next;
		lastFile = extend;
		// console.error('read file:', extend);

		const data = o.readJsonFile(extend);
		if (!data || data instanceof CommentArray || typeof data !== 'object') {
			throw new TypeError(`can not parse json object: ${extend}`);
		}

		extend = getPath(data, o.extendsField) || '';
		datas.push(delPath(data, o.extendsField));
	}

	let result: any = {};
	for (const object of datas.reverse()) {
		result = deepmerge(result, object, {
			arrayMerge: o.arrayMerge,
			customMerge: () => (a, b) => assign(a, b),
		});
	}
	return result;
}

function overwriteMerge(_destinationArray: any[], sourceArray: any[], _options?: Options) {
	return sourceArray;
}
const isModuleResolutionError = (ex: any) =>
	typeof ex === 'object' &&
	!!ex &&
	'code' in ex &&
	(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND');

function nodeResolution(current: string, id: string): string {
	const req = createRequire(current);
	try {
		return req.resolve(id);
	} catch (e: any) {
		if (isModuleResolutionError(e)) {
			throw new NotFoundError(id, current);
		}
		throw e;
	}
}
function resolveFilesystem(current: string, id: string): string {
	const file = resolve(current, '..', id);
	if (!existsSync(file)) {
		throw new NotFoundError(file, current);
	}
	return file;
}
