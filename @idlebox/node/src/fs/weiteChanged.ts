import { readFile as readFileAsync, readFileSync, writeFile as writeFileAsync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { exists, existsSync } from './exists.js';

const readFile = promisify(readFileAsync);
const writeFile = promisify(writeFileAsync);

export function writeFileIfChangeSync(file: string, data: string | Buffer) {
	if (existsSync(file)) {
		if (typeof data === 'string') {
			if (readFileSync(file, 'utf-8') === data) {
				return false;
			}
		} else {
			if (Buffer.compare(data, readFileSync(file)) === 0) {
				return false;
			}
		}
	}
	if (typeof data === 'string') {
		writeFileSync(file, data, 'utf-8');
	} else {
		writeFileSync(file, data);
	}
	return true;
}

export async function writeFileIfChange(file: string, data: string | Buffer) {
	if (await exists(file)) {
		if (typeof data === 'string') {
			if ((await readFile(file, 'utf-8')) === data) {
				return false;
			}
		} else {
			if (Buffer.compare(data, await readFile(file)) === 0) {
				return false;
			}
		}
	}
	if (typeof data === 'string') {
		await writeFile(file, data, 'utf-8');
	} else {
		await writeFile(file, data);
	}
	return true;
}
