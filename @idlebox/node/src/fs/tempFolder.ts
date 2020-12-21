import { mkdirSync, readdirSync, rmdirSync, statSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { existsSync } from './exists';

let registered = false;
const tempFolders: string[] = [];

export function createTempFolder(path: string) {
	if (existsSync(path)) {
		throw new Error('temp folder already exists: ' + path);
	}
	if (!registered) {
		process.on('beforeExit', onBeforeExit);
	}
	tempFolders.push(path);
	mkdirSync(path);
}

function rmdirpSync(p: string) {
	try {
		const stat = statSync(p);
		if (stat.isSymbolicLink() || stat.isFile()) {
			unlinkSync(p);
		} else if (stat.isDirectory()) {
			let succ = true;
			for (const item of readdirSync(p)) {
				if (!rmdirpSync(resolve(item, p))) {
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
