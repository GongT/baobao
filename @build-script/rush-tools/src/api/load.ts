import { basename, dirname } from 'node:path';
import { findUpUntil, findUpUntilSync } from '@idlebox/node';
import { loadJsonFile } from '@idlebox/node-json-edit';
import type { IRushConfig } from './limitedJson.js';

export function findRushJson(fromPath = process.cwd()): Promise<string | null> {
	if (basename(fromPath) === 'temp') {
		fromPath = dirname(fromPath);
	}
	return findUpUntil(fromPath, 'rush.json');
}

/** @deprecated */
export function findRushJsonSync(fromPath = process.cwd()): string | null {
	if (basename(fromPath) === 'temp') {
		fromPath = dirname(fromPath);
	}
	return findUpUntilSync(fromPath, 'rush.json');
}

export async function loadConfig(fromPath = process.cwd()): Promise<IRushConfig | null> {
	const p = await findRushJson(fromPath);
	if (p) {
		return loadJsonFile(p);
	}
	return null;
}

export async function findRushRootPath(fromPath = process.cwd()): Promise<string | null> {
	const p = await findRushJson(fromPath);
	if (p) return dirname(p);
	return null;
}

/** @deprecated */
export function findRushRootPathSync(fromPath = process.cwd()): string | null {
	const p = findRushJsonSync(fromPath);
	if (p) return dirname(p);
	return null;
}
