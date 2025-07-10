import { parseExportsField, type IFullExportsField, type IPackageJson } from '@idlebox/common';
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
	const ch = await writeJsonFileBack(packageJson);
	if (!ch) {
		throw new Error('package.json居然没有修改');
	}
	const currentPackagePath = resolve(currentProject, 'package.json');
	logger.log`写入到 long<${currentPackagePath}>`;
}

export function getExportsField() {
	return exports;
}
