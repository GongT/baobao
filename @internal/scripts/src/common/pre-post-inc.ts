import { logger } from '@idlebox/logger';
import {
	lstatSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	readlinkSync,
	rmdirSync,
	rmSync,
	symlinkSync,
	unlinkSync,
	type Stats,
} from 'node:fs';
import { dirname, resolve } from 'node:path';

export function readJson(file: string) {
	return JSON.parse(readFileSync(file, 'utf-8'));
}

export function rmdir(p: string) {
	let stat: Stats;
	try {
		stat = lstatSync(p);
	} catch (e: any) {
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
		throw new Error(`unexpected file: ${p}`);
	}
}

export function lstat_catch(f: string) {
	try {
		return lstatSync(f);
	} catch (e: any) {
		if (e.code === 'ENOENT') {
			return null;
		}
		throw e;
	}
}

export function ensureSymLinkSync(linkFile: string, targetFile: string, force = false) {
	try {
		const exists = readlinkSync(linkFile);
		if (exists === targetFile) {
			return;
		}
		logger.log('update link: %s -> %s', exists, targetFile);
		unlinkSync(linkFile);
	} catch (e: any) {
		if (e.code === 'ENOENT') {
			console.log('create link: %s -> %s', linkFile, targetFile);
			mkdirSync(dirname(linkFile), { recursive: true });
		} else if (e.code === 'EINVAL') {
			if (force) {
				console.log('update link: file -> %s', targetFile);
				rmSync(linkFile);
			} else {
				return;
			}
		} else {
			throw e;
		}
	}

	symlinkSync(targetFile, linkFile, 'file');
}
