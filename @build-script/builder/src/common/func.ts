import { resolve } from 'path';
import { TaskFunction } from 'gulp';
import { loadJsonFileSync } from '@idlebox/node-json-edit';

export function isArrayOfString(arr: string[]) {
	if (!Array.isArray(arr)) {
		return false;
	}
	return arr.every((item) => typeof item === 'string');
}

export function functionWithName<T extends TaskFunction>(fn: T, displayName: string, description: string): T {
	return Object.assign(fn, {
		displayName,
		description,
	});
}

export const colorDim = process.stdout.isTTY ? '\x1B[2m' : '';
export const colorReset = process.stdout.isTTY ? '\x1B[0m' : '';
export function getVersion() {
	const pkgPath = resolve(__dirname, '../../package.json');

	return loadJsonFileSync(pkgPath).version;
}
