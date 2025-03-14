import { mkdirSync, readdirSync, rmdirSync, statSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { IDisposable } from '@idlebox/common';
import { existsSync } from './exists.js';

let registered = false;
const tempFolders = new Set<string>();

export function createTempFolder(fullPath: string): IDisposable {
	if (existsSync(fullPath)) {
		throw new Error('temp folder already exists: ' + fullPath);
	}
	if (!registered) {
		process.on('beforeExit', onBeforeExit);
	}
	tempFolders.add(fullPath);
	mkdirSync(fullPath);

	return {
		dispose() {
			tempFolders.delete(fullPath);
			rmdirpSync(fullPath);
		},
	};
}

function rmdirpSync(p: string) {
	try {
		const stat = statSync(p);
		if (stat.isSymbolicLink() || stat.isFile()) {
			unlinkSync(p);
		} else if (stat.isDirectory()) {
			let succ = true;
			for (const item of readdirSync(p)) {
				if (!rmdirpSync(resolve(p, item))) {
					succ = false;
				}
			}
			if (succ) {
				rmdirSync(p);
			}
			return succ;
		}
		return true;
	} catch {
		return false;
	}
}

function onBeforeExit() {
	for (const path of tempFolders) {
		rmdirpSync(path);
	}
}
