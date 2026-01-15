import { registerGlobalLifecycle, type IDisposable } from '@idlebox/common';
import { mkdirSync, rmSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { existsSync } from './exists.js';

const tempFolders = new Set<string>();

export function createTempFolder(fullPath: string): IDisposable {
	if (existsSync(fullPath)) {
		throw new Error(`temp folder already exists: ${fullPath}`);
	}
	_register();

	tempFolders.add(fullPath);
	mkdirSync(fullPath);

	return {
		displayName: `TempFolder(${fullPath})`,
		dispose() {
			rmSync(fullPath, { recursive: true, force: true });
			tempFolders.delete(fullPath);
		},
	};
}

export function createTempFile(fullPath: string, force: boolean = false) {
	if (!force && existsSync(fullPath)) {
		throw new Error(`temp file already exists: ${fullPath}`);
	}

	_register();

	tempFolders.add(fullPath);

	return {
		displayName: `TempFile(${fullPath})`,
		dispose() {
			rmSync(fullPath, { recursive: true, force: true });
			tempFolders.delete(fullPath);
		},
	};
}

export function cancelDeleteTempfile() {
	tempFolderContext.dontDelete = true;
}

function _register() {
	if (!tempFolderContext.registered) {
		tempFolderContext.registered = true;
		registerGlobalLifecycle(tempFolderContext);
	}
}

const tempFolderContext = {
	registered: false,
	dontDelete: false,
	dispose() {
		if (this.dontDelete) return;
		return Promise.all(
			tempFolders.values().map((p) => {
				return rm(p, { force: true, recursive: true });
			}),
		);
	},
};
