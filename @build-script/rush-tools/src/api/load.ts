import { loadJsonFile, loadJsonFileSync } from '@idlebox/node-json-edit';
import { findUpUntil, findUpUntilSync } from '@idlebox/node';
import { basename, dirname } from 'path';
import { IRushConfig } from './limitedJson';

export function findRushJson(fromPath = process.cwd()): Promise<string | null> {
	if (basename(fromPath) === 'temp') {
		fromPath = dirname(fromPath);
	}
	return findUpUntil(fromPath, 'rush.json');
}
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
	} else {
		return null;
	}
}
export function loadConfigSync(fromPath = process.cwd()): IRushConfig | null {
	const p = findRushJsonSync(fromPath);
	if (p) {
		return loadJsonFileSync(p);
	} else {
		return null;
	}
}

export async function findRushRootPath(fromPath = process.cwd()): Promise<string | null> {
	const p = await findRushJson(fromPath);
	if (p) return dirname(p);
	return null;
}

export function findRushRootPathSync(fromPath = process.cwd()): string | null {
	const p = findRushJsonSync(fromPath);
	if (p) return dirname(p);
	return null;
}
