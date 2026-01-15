import type { ObjectEncodingOptions } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { isNotExistsError } from '@idlebox/errors';
export { existsSync } from 'node:fs';

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
			}
			return Buffer.allocUnsafe(0);
		}
		throw e;
	}
}
