import { lstatSync, readdirSync, readFileSync, rmdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

export const tempDir = resolve(fileURLToPath(import.meta.url), '../../temp');

export function readJson(file) {
	return JSON.parse(readFileSync(file, 'utf-8'));
}

export function rmdir(p) {
	let stat;
	try {
		stat = lstatSync(p);
	} catch (e) {
		if (e.code === 'ENOENT') {
			return;
		}
		throw e;
	}
	if (stat.isDirectory()) {
		for (const item of readdirSync(p)) {
			rmdir(resolve(p, item));
		}
		rmdirSync(p);
	} else if (stat.isSymbolicLink()) {
		unlinkSync(p);
	} else if (stat.isFile()) {
		throw new Error('unexpected file: ' + p);
	}
}

export function lstat_catch(f) {
	try {
		return lstatSync(f);
	} catch (e) {
		if (e.code === 'ENOENT') {
			return null;
		}
		throw e;
	}
}

export function* projects() {
	const yaml = readFileSync(resolve(tempDir, 'pnpm-workspace.yaml'), 'utf-8');
	for (let line of yaml.split('\n')) {
		line = line.trim();
		if (!line || line === 'packages:') continue;
		if (line.startsWith('- ')) {
			yield resolve(tempDir, line.substring(2));
		} else {
			return;
		}
	}
}
