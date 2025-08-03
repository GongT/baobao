/**
 * When writeXxx() functions return a bool, it means:
 *   * true: data has change, file content altered
 *   * false: data did not change, no write happen
 */

import { parse } from 'comment-json';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { cloneAttachedFieldsInto, getAttachedFile, setAttachedFile, setAttachedFormatter } from '../tools/attachData.js';
import { checkChange, loadFile, pathExists, saveFile } from '../tools/filesystem.js';
import { createDefaultFormatter } from '../tools/formatter.js';
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
 * attach file save path to "data" object
 */
export async function createJsonFile<T = any, K = any>(data: T, saveAs: string, charset: BufferEncoding = DEFAULT_ENCODING, formatter?: IFormatter<K>): Promise<JsonEditObject<T, K>> {
	const newData = Object.assign({}, data);
	setAttachedFile(newData, { originalPath: saveAs, encoding: charset, exists: false });
	if (formatter) {
		setAttachedFormatter(data, formatter);
	} else {
		const format = await createDefaultFormatter(undefined, saveAs);
		setAttachedFormatter(data, format);
	}
	return newData as JsonEditObject<T>;
}

/**
 * Unconditional write `data` back into it's source file
 */
export async function writeJsonFileBackForce(data: any): Promise<void> {
	const file = requireFile(data);
	const str = await stringifyJsonText(data);
	await saveFile(file, str);
}

/**
 * Check if `data` has changed, if so, write it back into it's source file
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
 * check if `data` is same with content of `file`, if not, overwrite `file`
 */
export async function writeJsonFile(file: string, data: any, charset: BufferEncoding = DEFAULT_ENCODING): Promise<boolean> {
	file = abs(file);
	const newData = Object.assign({}, data);
	cloneAttachedFieldsInto(data, newData);
	if (await pathExists(file)) {
		const targetFile = await loadFile(file, charset);
		setAttachedFile(newData, targetFile);
	} else {
		setAttachedFile(newData, { originalPath: file, encoding: 'utf-8', exists: false });
	}

	const ret = await writeJsonFileBack(newData);

	if (!getAttachedFile(data)) {
		setAttachedFile(data, getAttachedFile(newData)!);
	}

	return ret;
}

export async function loadJsonFileIfExists<T = any, K = any>(file: string, defaultValue: T = {} as any, charset: BufferEncoding = DEFAULT_ENCODING, formatter?: IFormatter<K>): Promise<JsonEditObject<T, K>> {
	file = abs(file);
	if (await pathExists(file)) {
		return loadJsonFile(file, charset);
	}
	const newData = Object.assign({}, defaultValue);
	setAttachedFile(newData, { originalPath: file, encoding: 'utf-8', exists: false });
	if (formatter) {
		setAttachedFormatter(newData, formatter);
	} else {
		const format = await createDefaultFormatter(undefined, file);
		setAttachedFormatter(newData, format);
	}
	return newData as JsonEditObject<T, K>;
}

export async function loadJsonFile<T = any, K = any>(file: string, charset: BufferEncoding = DEFAULT_ENCODING, formatter?: IFormatter<K>): Promise<JsonEditObject<T, K>> {
	file = abs(file);
	const targetFile = await loadFile(file, charset);
	const data: any = parse(targetFile.originalContent);
	setAttachedFile(data, targetFile);
	if (formatter) {
		setAttachedFormatter(data, formatter);
	} else {
		const format = await createDefaultFormatter(targetFile.originalContent, file);
		setAttachedFormatter(data, format);
	}
	return data as JsonEditObject<T, K>;
}

export function parseJsonText(text: string): any {
	return parse(text);
}

function abs(p: string) {
	if (isAbsolute(p)) {
		return p;
	}
	return resolve(process.cwd(), p);
}

export async function readCommentJsonFile(file: string, charset: BufferEncoding = DEFAULT_ENCODING): Promise<any> {
	file = abs(file);
	const data = await readFile(file, charset);
	return parse(data, undefined, true);
}

export function readCommentJsonFileSync(file: string, charset: BufferEncoding = DEFAULT_ENCODING): any {
	file = abs(file);
	const data = readFileSync(file, charset);
	return parse(data, undefined, true);
}
