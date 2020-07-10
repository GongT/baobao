/**
 * When writeXxx() functions return a bool, it means:
 *   * true: data has change, file content altered
 *   * false: data did not change, no write happen
 */

import { isAbsolute, resolve } from 'path';
import { parse } from 'comment-json';
import { cloneAttachedFieldsInto, getAttachedFile, setAttachedFile, setAttachedFormat } from '../tools/attachData';
import {
	checkChange,
	pathExistsAsync,
	pathExistsSync,
	loadFileAsync,
	loadFileSync,
	writeAsync,
	writeSync,
} from '../tools/filesystem';
import { PrettyFormat } from '../tools/prettyFormat';
import { stringifyJsonText } from './format';

const DEFAULT_ENCODING = 'utf-8';

function requireFile(data: any) {
	const f = getAttachedFile(data);
	if (!f) {
		throw new Error('not readed by loadJsonFile() funnctions.');
	}
	return f;
}

/**
 * @see {writeJsonFileBackForce}
 * Synchronize operation
 */
export function writeJsonFileBackForceSync(data: any): void {
	const file = requireFile(data);
	const str = stringifyJsonText(data);
	writeSync(file, str);
}

/**
 * Unconditional write `data` back into it's source file
 */
export function writeJsonFileBackForce(data: any): Promise<void> {
	const file = requireFile(data);
	const str = stringifyJsonText(data);
	return writeAsync(file, str);
}

/**
 * @see {writeJsonFileBack}
 * Synchronize operation
 */
export function writeJsonFileBackSync(data: any): boolean {
	const file = requireFile(data);
	const str = stringifyJsonText(data);
	if (checkChange(file, str)) {
		writeSync(file, str);
		return true;
	} else {
		return false;
	}
}

/**
 * Check if `data` has changed, if so, write it back into it's source file
 */
export async function writeJsonFileBack(data: any): Promise<boolean> {
	const file = requireFile(data);
	const str = stringifyJsonText(data);
	if (checkChange(file, str)) {
		await writeAsync(file, str);
		return true;
	} else {
		return false;
	}
}

/**
 * @see {writeJsonFile}
 * Synchronize operation
 */
export function writeJsonFileSync(file: string, data: any, charset: BufferEncoding = DEFAULT_ENCODING): boolean {
	file = abs(file);
	const newData = Object.assign({}, data);
	cloneAttachedFieldsInto(data, newData);
	if (pathExistsSync(file)) {
		const targetFile = loadFileSync(file, charset);
		setAttachedFile(newData, targetFile);
	} else {
		setAttachedFile(newData, { originalPath: file, encoding: 'utf-8', exists: false });
	}
	return writeJsonFileBackSync(newData);
}

/**
 * check if `data` is same with content of `file`, if not, overwrite `file`
 */
export async function writeJsonFile(
	file: string,
	data: any,
	charset: BufferEncoding = DEFAULT_ENCODING
): Promise<boolean> {
	file = abs(file);
	const newData = Object.assign({}, data);
	cloneAttachedFieldsInto(data, newData);
	if (await pathExistsAsync(file)) {
		const targetFile = await loadFileAsync(file, charset);
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

export function loadJsonFileIfExistsSync(
	file: string,
	defaultValue: any = {},
	charset: BufferEncoding = DEFAULT_ENCODING
): Promise<any> {
	file = abs(file);
	if (pathExistsSync(file)) {
		return loadJsonFileSync(file, charset);
	} else {
		const newData = Object.assign({}, defaultValue);
		setAttachedFile(newData, { originalPath: file, encoding: 'utf-8', exists: false });
		const format = new PrettyFormat();
		format.learnFromFileSync(file);
		setAttachedFormat(newData, format);
		return newData;
	}
}
export async function loadJsonFileIfExists(
	file: string,
	defaultValue: any = {},
	charset: BufferEncoding = DEFAULT_ENCODING
): Promise<any> {
	file = abs(file);
	if (pathExistsSync(file)) {
		return loadJsonFile(file, charset);
	} else {
		const newData = Object.assign({}, defaultValue);
		setAttachedFile(newData, { originalPath: file, encoding: 'utf-8', exists: false });
		const format = new PrettyFormat();
		await format.learnFromFileAsync(file);
		setAttachedFormat(newData, format);
		return newData;
	}
}

export function loadJsonFileSync(file: string, charset: BufferEncoding = DEFAULT_ENCODING): any {
	file = abs(file);
	const targetFile = loadFileSync(file, charset);
	const data = parse(targetFile.originalContent);
	setAttachedFile(data, targetFile);
	const format = new PrettyFormat();
	format.learnFromFileSync(file, targetFile.originalContent);
	setAttachedFormat(data, format);
	return data;
}

export async function loadJsonFile(file: string, charset: BufferEncoding = DEFAULT_ENCODING): Promise<any> {
	file = abs(file);
	const targetFile = await loadFileAsync(file, charset);
	const data = parse(targetFile.originalContent);
	setAttachedFile(data, targetFile);
	const format = new PrettyFormat();
	await format.learnFromFileAsync(file, targetFile.originalContent);
	setAttachedFormat(data, format);
	return data;
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
