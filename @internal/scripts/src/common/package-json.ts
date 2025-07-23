import { parseExportsField, type IExportMap, type IFullExportsField, type IPackageJson } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { logger } from '@idlebox/logger';
import { resolve } from 'node:path';
import { currentProject } from './constants.js';

export let packageJson: IPackageJson;
let exports: IFullExportsField;

export async function readPackageJson() {
	if (packageJson) return;

	const currentPackagePath = resolve(currentProject, 'package.json');
	packageJson = await loadJsonFile(currentPackagePath);

	exports = parseExportsField(packageJson.exports);
	packageJson.exports = exports;
}

export async function writeBack() {
	(packageJson.exports as IExportMap)['./package.json'] = './package.json';

	const ch = await writeJsonFileBack(packageJson);
	packageJson = null as any;

	if (!ch) {
		throw new Error('package.json居然没有修改');
		// logger.debug`package.json没有修改，跳过写入`;
		// return;
	}
	const currentPackagePath = resolve(currentProject, 'package.json');
	logger.success`写入到 long<${currentPackagePath}>`;
}

export function getExportsField() {
	return exports;
}
