import { assign, CommentArray } from 'comment-json';
import deepmerge, { type Options } from 'deepmerge';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import objectPath from 'object-path';
import { ExtendError } from './error.js';
import { readJsonFile } from './loader.js';

type IReadFile = (file: string) => any;
type IResolver = (current: string, id: string) => string;

/**
 */
export interface ILoadJsonOptions {
	/**
	 * need to be sync function
	 */
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

export class ResolveError extends Error {
	public readonly code: string;

	constructor(id: string, current: string) {
		super(`Cannot resolve module "${id}" from "${current}"`);
		this.name = 'ResolveError';
		this.code = 'MODULE_NOT_FOUND';
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

		let data: any;
		try {
			data = o.readJsonFile(extend);
		} catch (e: any) {
			throw new TypeError(`${e.message} in json file: "${extend}"`, { cause: e });
		}
		if (!data || data instanceof CommentArray || typeof data !== 'object') {
			throw new TypeError(`invalid json object in "${extend}"`);
		}

		extend = objectPath.get(data, o.extendsField) || '';
		datas.push(objectPath.del(data, o.extendsField));
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
			throw new ExtendError(id, current);
		}
		throw e;
	}
}
function resolveFilesystem(current: string, id: string): string {
	const file = resolve(current, '..', id);
	if (!existsSync(file)) {
		throw new ExtendError(file, current);
	}
	return file;
}
