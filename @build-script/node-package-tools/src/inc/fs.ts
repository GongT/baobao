import type { IPackageJson } from '@idlebox/common';
import { loadJsonFile } from '@idlebox/node-json-edit';
import { readFileSync } from 'node:fs';

export function readJsonSync(file: string) {
	return JSON.parse(readFileSync(file, 'utf-8'));
}

export async function readPackageJson(file: string): Promise<IPackageJson> {
	return loadJsonFile(file);
}

export function escapeName(name: string) {
	if (name.startsWith('@')) {
		const parts = name.split('/');
		return '_' + parts.join('__');
	}
	return name;
}
