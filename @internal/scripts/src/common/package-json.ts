import { parseExportsField, type IExportCondition, type IExportMap, type IExportsField, type IFullExportsField, type IPackageJson } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { logger } from '@idlebox/logger';
import { resolve } from 'node:path';
import { formatFile } from './format.js';
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

function reorder_exports() {
	function reorder_one(item: IExportCondition | string): IExportCondition | string {
		if (typeof item === 'string') return item;
		if (Object.keys(item).length === 1 && item.default) return item.default;
		const { 'early-loader': lowlevel, source, types, esbuild, default: def, ...rest } = item;
		return {
			...(lowlevel ? { 'early-loader': lowlevel } : {}),
			...(types ? { types } : {}),
			...(esbuild ? { esbuild } : {}),
			...(source ? { source } : {}),
			...rest,
			...(def ? { default: def } : {}),
		};
	}

	function reorder_map(map: IExportsField): IExportsField {
		if (typeof map === 'string') return map;
		for (const [key, item] of Object.entries(map)) {
			if (typeof item === 'string' || !item) continue;
			map[key] = reorder_map(item);
			map[key] = reorder_one(map[key]);
		}
		return map;
	}

	packageJson.exports = reorder_map(packageJson.exports);
}

export async function writeBack() {
	(packageJson.exports as IExportMap)['./package.json'] = './package.json';
	reorder_exports();

	const ch = await writeJsonFileBack(packageJson);
	packageJson = null as any;

	logger.success`写入 package.json | ${ch ? '有改动' : '没有改动'}`;

	const currentPackagePath = resolve(currentProject, 'package.json');
	await formatFile(currentPackagePath);

	return ch;
}

export function getExportsField() {
	return exports;
}
