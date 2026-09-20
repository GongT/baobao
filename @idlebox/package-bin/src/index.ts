import type { IPackageJson } from '@idlebox/common';
import { createRequire, findPackageJSON } from 'node:module';
import { basename, dirname, join } from 'node:path';

export async function findBinary(name: string, base: string | URL, binaryName?: string): Promise<string | null> {
	const packageJsonPath = findPackageJSON(name, base);
	if (!packageJsonPath) return null;

	const content = await import(packageJsonPath, { with: { type: 'json' } });
	const value = handle(content, binaryName);
	if (!value) return null;
	return join(dirname(packageJsonPath), value);
}

export function findBinarySync(name: string, base: string | URL, binaryName?: string): string | null {
	const packageJsonPath = findPackageJSON(name, base);
	if (!packageJsonPath) return null;

	const require = createRequire(base);
	const content = require(packageJsonPath) as IPackageJson;
	const value = handle(content, binaryName);
	if (!value) return null;
	return join(dirname(packageJsonPath), value);
}

function handle(content: IPackageJson, binaryName?: string): string | null {
	const bins = content.bin;
	if (!bins) return null;
	if (typeof bins === 'string') return bins;
	const keys = Object.keys(bins ?? {});
	if (!binaryName) {
		if (keys.length === 1) return bins[keys[0]];
		if (content.name) {
			const base = basename(content.name);
			if (bins[base]) return bins[base];
		}
		throw new Error(`Multiple binaries found, please specify the binary name: ${keys.join(', ')}`);
	} else if (bins[binaryName]) {
		return bins[binaryName];
	} else if (keys.length === 1) {
		return bins[keys[0]];
	} else {
		throw new Error(`Binary "${binaryName}" not found. Available binaries: ${keys.join(', ')}`);
	}
}
