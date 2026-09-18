import { isNotExistsError } from '@idlebox/common';
import { lstatSync, readFileSync, statSync, writeFileSync, type Stats } from 'node:fs';
import { lstat, readFile, stat, writeFile } from 'node:fs/promises';

export function writeFileIfChangeSync(file: string, data: string | Buffer) {
	if (typeof data === 'string') data = Buffer.from(data, 'utf-8');

	try {
		let ss: Stats | undefined;
		try {
			ss = statSync(file);
		} catch (e) {
			if (!isNotExistsError(e)) throw e;
			ss = lstatSync(file);
		}

		if (sizeCompare(ss, data) && Buffer.compare(data, readFileSync(file)) === 0) {
			return false;
		}
	} catch (e) {
		if (!isNotExistsError(e)) throw e;
	}

	if (typeof data === 'string') {
		writeFileSync(file, data, 'utf-8');
	} else {
		writeFileSync(file, data);
	}
	return true;
}

export async function writeFileIfChange(file: string, data: string | Buffer) {
	if (typeof data === 'string') data = Buffer.from(data, 'utf-8');

	const ss = await stat(file)
		.catch((e) => {
			if (!isNotExistsError(e)) throw e;
			return lstat(file);
		})
		.catch((e) => {
			if (!isNotExistsError(e)) throw e;
			return null;
		});
	if (ss) {
		if (sizeCompare(ss, data) && Buffer.compare(data, await readFile(file)) === 0) {
			return false;
		}
	}
	if (typeof data === 'string') {
		await writeFile(file, data, 'utf-8');
	} else {
		await writeFile(file, data);
	}
	return true;
}

function sizeCompare(ss: Stats, data: Buffer) {
	return ss.size === data.byteLength;
}
