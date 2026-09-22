import { parseExportsField, type IExportMap, type IFullExportsField, type IPackageJson } from '@idlebox/common';
import { loadJsonFile, parseJsonText, writeJsonFile } from '@idlebox/json-edit';
import { logger } from '@idlebox/logger';
import { execaNode } from 'execa';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
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

	const pkgJson = resolve(currentProject, 'package.json');

	// 重排序
	const unpmBin = await findUnpmBin();
	const { stdout } = await execaNode({
		stderr: 'inherit',
		stdin: await readFile(pkgJson),
		stdout: 'pipe',
		encoding: 'utf8',
		nodeOptions: process.execArgv,
		cwd: currentProject,
	})`${unpmBin} format-package -`;
	const pkgData = parseJsonText(stdout);
	const ch = await writeJsonFile(pkgJson, pkgData);

	packageJson = null as any;

	logger.success`写入 package.json | ${ch ? '有改动' : '没有改动'}`;

	return ch;
}

export function getExportsField(): IFullExportsField {
	return exports;
}

let unpmBin: string | null = null;
async function findUnpmBin() {
	if (unpmBin) return unpmBin;
	const pkgJsonPath = import.meta.resolve('unipm/package.json').slice(7); // remove 'file://'
	const pkgJson = await loadJsonFile(pkgJsonPath);
	const binRel = pkgJson.bin.unipm;
	unpmBin = resolve(pkgJsonPath, '..', binRel);
	logger.debug`Found unipm bin at ${unpmBin}`;
	return unpmBin;
}
function simplifyExportsField(exports: IFullExportsField) {
	for (const key in exports) {
		const value = exports[key];
		if (typeof value === 'object' && 'default' in value && Object.keys(value).length === 1) {
			exports[key] = value.default as any;
		}
	}
}
