import { ObjectEncodingOptions } from 'fs';
import { access, readFile } from 'fs/promises';
export { existsSync } from 'fs';

export async function exists(path: string) {
	try {
		await access(path);
		return true;
	} catch (e: any) {
		if (isNotExistsError(e)) return false;
		throw e;
	}
}

export const readFileIfExists: typeof readFile = _readFileIfExists as any;

async function _readFileIfExists(file: string, encoding?: NodeJS.BufferEncoding | ObjectEncodingOptions) {
	try {
		return await readFile(file, encoding);
	} catch (e: any) {
		if (isNotExistsError(e)) {
			if (typeof encoding === 'string' || typeof encoding?.encoding === 'string') {
				return '';
			} else {
				return Buffer.allocUnsafe(0);
			}
		}
		throw e;
	}
}

export function isNotExistsError(e: any) {
	return e.code === 'ENOENT';
}

export function isExistsError(e: any) {
	return e.code === 'EEXIST';
}

export function isTypeError(e: any) {
	return e.code === 'EISDIR' || e.code === 'ENOTDIR';
}
