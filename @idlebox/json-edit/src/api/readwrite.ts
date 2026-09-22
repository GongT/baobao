import { isNotExistsError } from '@idlebox/errors';
import { parse } from 'comment-json';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { cloneAttachedFieldsInto, getAttachedFile, getAttachedFormatter, setAttachedFile, setAttachedFormatter } from '../tools/attachData.js';
import { checkChange, loadFile, loadFileSync, pathExists, saveFile } from '../tools/filesystem.js';
import { defaultFormatFactory } from '../tools/formatter.js';
import { stringifyJsonText } from './format.js';
import type { IFormatter, JsonEditObject } from './types.js';

const DEFAULT_ENCODING = 'utf-8';

function requireFile(data: any) {
	const f = getAttachedFile(data);
	if (!f) {
		throw new Error('not readed by loadJsonFile() funnctions.');
	}
	return f;
}

/**
 * 将文件信息附加到 `data` 对象上
 */
export async function createJsonFile<T = any, K = any>(
	data: T,
	saveAs: string,
	charset: BufferEncoding = DEFAULT_ENCODING,
	formatter?: IFormatter<K>,
): Promise<JsonEditObject<T, K>> {
	const newData = clone(data);
	setAttachedFile(newData, { originalPath: saveAs, encoding: charset, exists: false });
	if (formatter) {
		setAttachedFormatter(newData, formatter);
	} else if (defaultFormatFactory) {
		const format = await defaultFormatFactory();
		setAttachedFormatter(newData, format);
	}
	return newData as JsonEditObject<T, K>;
}

/**
 * 将 `data` 写回到它的源文件
 * 必须存在附加的文件信息
 */
export async function writeJsonFileBackForce(data: any): Promise<void> {
	const file = requireFile(data);
	const str = await stringifyJsonText(data);
	await saveFile(file, str);
}

/**
 * 检查 `data` 是否有变化，如果有变化，则写回到它的源文件
 * 必须存在附加的文件信息
 *
 * @returns 如果实际发生了写入，返回 `true`，否则返回 `false`
 */
export async function writeJsonFileBack(data: any): Promise<boolean> {
	const file = requireFile(data);
	const str = await stringifyJsonText(data);
	if (checkChange(file, str)) {
		await saveFile(file, str);
		return true;
	}
	return false;
}

/**
 * 检查 `data` 是否与 `file` 的内容相同，如果不同，则覆盖 `file`
 *
 * 如果data是本包产生的（例如load、parse），则会保留其原有的文件信息（即使不存在）。
 * 如果data是普通对象，则会将file路径附加到data上。
 *
 * @returns 如果实际发生了写入，返回 `true`，否则返回 `false`
 */
export async function writeJsonFile(file: string | URL, data: any, charset: BufferEncoding = DEFAULT_ENCODING): Promise<boolean> {
	file = abs(file);
	const newData = clone(data);
	cloneAttachedFieldsInto(data, newData);
	if (await pathExists(file)) {
		const targetFile = await loadFile(file, charset);
		setAttachedFile(newData, targetFile);
	} else {
		setAttachedFile(newData, { originalPath: file, encoding: charset, exists: false });
	}

	const ret = await writeJsonFileBack(newData);

	if (!getAttachedFile(data)) {
		setAttachedFile(data, getAttachedFile(newData));
	}

	return ret;
}

/**
 * @deprecated 使用带参数的 `loadJsonFile`
 */
export async function loadJsonFileIfExists<T extends object = any, K = any>(
	file: string | URL,
	defaultValue: T = {} as any,
	charset: BufferEncoding = DEFAULT_ENCODING,
	formatter?: IFormatter<K>,
): Promise<JsonEditObject<T, K>> {
	file = abs(file);
	if (await pathExists(file)) {
		return loadJsonFile<T, K>(file, charset);
	}
	const newData = clone(defaultValue);
	setAttachedFile(newData, { originalPath: file, encoding: 'utf-8', exists: false });
	if (formatter) {
		setAttachedFormatter(newData, formatter);
	} else if (defaultFormatFactory) {
		const format = await defaultFormatFactory();
		setAttachedFormatter(newData, format);
	}
	return newData as JsonEditObject<T, K>;
}

interface ILoadOptions<T, FmtOpt = unknown> {
	readonly charset?: BufferEncoding;
	readonly formatter?: IFormatter<FmtOpt>;
	readonly defaults?: T;
	readonly removeComments?: boolean;
}

/**
 * 从文件中加载 JSON
 * 返回的对象带有文件信息，可实现修改并回写
 */
export async function loadJsonFile<T extends object = any, FmtOpt = unknown>(
	file: string | URL,
	charset?: BufferEncoding,
	formatter?: IFormatter<FmtOpt>,
): Promise<JsonEditObject<T, FmtOpt>>;
export async function loadJsonFile<T extends object = any, FmtOpt = unknown>(
	file: string | URL,
	options: ILoadOptions<T, FmtOpt>,
): Promise<JsonEditObject<T, FmtOpt>>;
export async function loadJsonFile<T extends object = any, FmtOpt = unknown>(
	file: string | URL,
	charset: BufferEncoding | ILoadOptions<T, FmtOpt> = DEFAULT_ENCODING,
	formatter?: IFormatter<FmtOpt>,
): Promise<JsonEditObject<T, FmtOpt>> {
	file = abs(file);
	const options: ILoadOptions<T, FmtOpt> = typeof charset === 'object' ? charset : { charset, formatter };

	let data: any;
	try {
		const fileInfo = await loadFile(file, options.charset ?? DEFAULT_ENCODING);
		data = parse(fileInfo.originalContent, null, options.removeComments ?? false);
		setAttachedFile(data, fileInfo);
	} catch (e) {
		if (isNotExistsError(e)) {
			if (options.defaults !== undefined) {
				data = clone(options.defaults);
				setAttachedFile(data, { originalPath: file, encoding: options.charset ?? DEFAULT_ENCODING, exists: false });
			} else {
				throw e;
			}
		}
	}
	if (options.formatter) {
		setAttachedFormatter(data, options.formatter);
	} else if (defaultFormatFactory) {
		const format = await defaultFormatFactory();
		setAttachedFormatter(data, format);
	}
	return data as any;
}

export function loadJsonFileSync<T extends object = any>(file: string | URL, charset?: BufferEncoding): JsonEditObject<T, unknown>;
export function loadJsonFileSync<T extends object = any, FmtOpt = unknown>(file: string | URL, options?: ILoadOptions<T, FmtOpt>): JsonEditObject<T, FmtOpt>;
export function loadJsonFileSync<T extends object = any, FmtOpt = unknown>(
	file: string | URL,
	charset: BufferEncoding | ILoadOptions<T, FmtOpt> = DEFAULT_ENCODING,
): JsonEditObject<T, FmtOpt> {
	file = abs(file);
	const options: ILoadOptions<T, FmtOpt> = typeof charset === 'object' ? charset : { charset };

	let data: any;
	try {
		const fileInfo = loadFileSync(file, options.charset ?? DEFAULT_ENCODING);
		data = parse(fileInfo.originalContent, null, options.removeComments ?? false);
		setAttachedFile(data, fileInfo);
	} catch (e) {
		if (isNotExistsError(e)) {
			if (options.defaults !== undefined) {
				data = clone(options.defaults);
				setAttachedFile(data, { originalPath: file, encoding: options.charset ?? DEFAULT_ENCODING, exists: false });
			} else {
				throw e;
			}
		}
	}

	if (options.formatter) {
		setAttachedFormatter(data, options.formatter);
	} else if (defaultFormatFactory) {
		const format = defaultFormatFactory();
		if (format) {
			if ('then' in format) {
				format.then((resolvedFormat) => {
					if (!getAttachedFormatter(data).formatter) {
						setAttachedFormatter(data, resolvedFormat);
					}
				});
			} else {
				setAttachedFormatter(data, format);
			}
		}
	}
	return data as any;
}

/**
 * 解析 JSON 文本，返回对应的对象
 */
export function parseJsonText(text: string): any {
	return parse(text, null, false);
}

function abs(p: string | URL): string {
	if (p instanceof URL) {
		p = p.pathname;
	} else if (p.startsWith('file://')) {
		p = p.slice(7);
	}
	if (isAbsolute(p)) {
		return p;
	}
	return resolve(process.cwd(), p);
}

/**
 * 从文件中加载带注释的 JSON，不附带任何额外信息（如注释）
 */
export async function readCommentJsonFile(file: string | URL, charset: BufferEncoding = DEFAULT_ENCODING): Promise<any> {
	file = abs(file);
	const data = await readFile(file, charset);
	return parse(data, undefined, true);
}

/**
 * 从文件中加载带注释的 JSON，不附带任何额外信息（如注释）
 */
export function readCommentJsonFileSync(file: string | URL, charset: BufferEncoding = DEFAULT_ENCODING): any {
	file = abs(file);
	const data = readFileSync(file, charset);
	return parse(data, undefined, true);
}

/**
 * 创建给定对象的浅拷贝，保留其属性描述符和原型。
 * @param object 要克隆的对象。
 * @returns 一个具有与原始对象相同属性和原型的新对象。
 */
function clone(object: any) {
	const descriptors = Object.getOwnPropertyDescriptors(object);
	const newObject = Object.create(Object.getPrototypeOf(object), descriptors);
	return newObject;
}
