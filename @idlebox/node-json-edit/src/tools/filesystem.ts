import {
	access as accessAsync,
	accessSync,
	mkdir as mkdirAsync,
	mkdirSync,
	readFile as readFileAsync,
	readFileSync,
	writeFile as writeFileAsync,
	writeFileSync,
} from 'fs';
import { dirname } from 'path';
import { promisify } from 'util';

export interface IInternalFile {
	originalPath: string;
	originalContent?: string;
	encoding: BufferEncoding;
	exists: boolean;
}
export interface IInternalFileFull extends IInternalFile {
	originalContent: string;
}

const access = promisify(accessAsync);
const readFile = promisify(readFileAsync);
const writeFile = promisify(writeFileAsync);
const mkdir = promisify(mkdirAsync);

export function pathExistsAsync(file: string) {
	return access(file).then(
		() => true,
		() => false
	);
}

export function pathExistsSync(file: string) {
	try {
		accessSync(file);
		return true;
	} catch (e) {
		return false;
	}
}

export function loadFileSync(file: string, encoding: BufferEncoding): IInternalFileFull {
	return {
		originalPath: file,
		originalContent: readFileSync(file, encoding),
		encoding: encoding,
		exists: true,
	};
}

export async function loadFileAsync(file: string, encoding: BufferEncoding): Promise<IInternalFileFull> {
	return {
		originalPath: file,
		originalContent: await readFile(file, encoding),
		encoding: encoding,
		exists: true,
	};
}

export function checkChange(file: IInternalFile, newContent: string) {
	return file.originalContent !== newContent;
}

export async function writeAsync(file: IInternalFile, newContent: string) {
	if (!file.originalPath) {
		throw new Error('no where to write');
	}
	if (!file.exists) {
		await mkdir(dirname(file.originalPath), { recursive: true });
	}
	await writeFile(file.originalPath, newContent, file.encoding);
	file.originalContent = newContent;
	file.exists = true;
}

export function writeSync(file: IInternalFile, newContent: string) {
	if (!file.originalPath) {
		throw new Error('no where to write');
	}
	if (!file.exists) {
		mkdirSync(dirname(file.originalPath), { recursive: true });
	}
	writeFileSync(file.originalPath, newContent, file.encoding);
	file.originalContent = newContent;
	file.exists = true;
}
