import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface IInternalFile {
	originalPath: string;
	originalContent?: string;
	encoding: BufferEncoding;
	exists: boolean;
}
export interface IInternalFileFull extends IInternalFile {
	originalContent: string;
}

export function pathExists(file: string) {
	return access(file).then(
		() => true,
		() => false
	);
}

export async function loadFile(file: string, encoding: BufferEncoding): Promise<IInternalFileFull> {
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

export async function saveFile(file: IInternalFile, newContent: string) {
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
