import { parseExportsField, type IExportMap, type IFullExportsField, type IPackageJson } from '@idlebox/common';
import { loadJsonFile } from '@idlebox/json-edit';
import { logger } from '@idlebox/logger';
import { execaNode } from 'execa';
import { resolve } from 'node:path';
import { writeAsPlainJson } from './format.js';
import { currentProject } from './paths/current.js';

export let packageJson: IPackageJson;
let exports: IFullExportsField;

export async function readPackageJson() {
	if (packageJson) return;

	const currentPackagePath = resolve(currentProject, 'package.json');
	packageJson = await loadJsonFile(currentPackagePath);

	exports = parseExportsField(packageJson.exports);
	packageJson.exports = exports;
}

export async function writeBackPackageJson() {
	(packageJson.exports as IExportMap)['./package.json'] = './package.json';

	simplifyExportsField(exports);

	const ch = await writeAsPlainJson(resolve(currentProject, 'package.json'), packageJson);
	packageJson = null as any;

	logger.success`写入 package.json | ${ch ? '有改动' : '没有改动'}`;

	const unpmBin = await findUnpmBin();
	logger.debug`Found unipm bin at ${unpmBin}`;
	await execaNode({
		stdio: 'inherit',
		nodeOptions: process.execArgv,
		cwd: currentProject,
	})`${unpmBin} format-package -i`;

	return ch;
}

export function getExportsField() {
	return exports;
}

async function findUnpmBin() {
	const pkgJsonPath = import.meta.resolve('unipm/package.json').slice(7); // remove 'file://'
	const pkgJson = await loadJsonFile(pkgJsonPath);
	const binRel = pkgJson.bin.unipm;
	return resolve(pkgJsonPath, '..', binRel);
}
function simplifyExportsField(exports: IFullExportsField) {
	for (const key in exports) {
		const value = exports[key];
		if (typeof value === 'object' && 'default' in value && Object.keys(value).length === 1) {
			exports[key] = value.default as any;
		}
	}
}
