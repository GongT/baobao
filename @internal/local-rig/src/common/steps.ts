/** biome-ignore-all lint/performance/useTopLevelRegex: <explanation> */
import { parseExportsField, type IExportMap, type IFullExportsField, type IPackageJson } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { logger } from '@idlebox/logger';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPublish, monorepoRoot, packagePath, projectPath } from './constants.js';

let packageJson: IPackageJson;
let exports: IFullExportsField;

export async function readPackageJson() {
	if (packageJson) return;
	packageJson = await loadJsonFile(packagePath);

	exports = parseExportsField(packageJson.exports);
	packageJson.exports = exports;
}

export async function writeBack() {
	const ch = await writeJsonFileBack(packageJson);
	if (!ch) {
		throw new Error('package.json居然没有修改');
	}
	logger.log`写入到 ${packagePath}`;
}

export function makeInformationalFields() {
	function make(field: string, value: any) {
		if (Object.hasOwn(packageJson, field)) {
			logger.warn`package.json中已存在 ${field} 字段，跳过设置`;
			return;
		}
		packageJson[field] = value;
	}

	make('license', 'MIT');
	make('author', 'GongT <admin@gongt.me>');
	make('repository', 'https://github.com/GongT/baobao');
}

export function sanitizePackageJson() {
	if (!Object.hasOwn(packageJson, 'type')) {
		logger.warn`package.json中缺少 type 字段，设置为 module`;
		packageJson.type = 'module';
	}
	if (!Object.hasOwn(packageJson, 'description')) {
		logger.warn`package.json中缺少 description`;
	}
	if (!Object.hasOwn(packageJson, 'keywords') || packageJson.keywords.length === 0) {
		logger.warn`package.json中缺少 keywords`;
	}
}

/**
 * 如果source和types相同，则移除 types 字段
 * 此types是为了在未编译当前项目时编译依赖时使用，发布后直接使用默认类型即可
 */
export function removeExportsTypes() {
	for (const [key, def] of Object.entries(exports)) {
		if (def.source && def.source === def.types) {
			logger.log`删除exports.${key}.types`;
			delete def.types;
		}
	}
}

/**
 * 确保 exports['./package.json'] 存在。
 */
export function ensureExportsPackageJson() {
	(packageJson.exports as IExportMap)['./package.json'] = './package.json';
}

/**
 * 使得 exports['.'] 和 packageJson.main 保持一致。
 */
export function mirrorExportsAndMain() {
	if (!exports['.']) {
		if (packageJson.main) {
			logger.warn`将main同步到exports`;
			(packageJson.exports as IExportMap)['.'] = packageJson.main;
		}
		return;
	}

	const main = exports['.'].default;
	if (main) {
		logger.log`将exports[.]同步到main`;
		if (packageJson.main && packageJson.main !== main) {
			logger.fatal`long<${packagePath}> main字段设置为 ${packageJson.main}, 但 exports['.'].default 是 ${main}`;
		}
		packageJson.main = main;
	}
}

/**
 * 删除exports和bin里关于loader的内容
 */
export function removeLoaderFromExportsAndBin() {
	for (const pathRef of Object.values(exports)) {
		if (pathRef.import) pathRef.import = modifyLoaderInString(pathRef.import);
		if (pathRef.default) pathRef.default = modifyLoaderInString(pathRef.default);
	}
	if (typeof packageJson.bin === 'object') {
		for (const key of Object.keys(packageJson.bin)) {
			packageJson.bin[key] = modifyLoaderInString(packageJson.bin[key]);
		}
	} else if (typeof packageJson.bin === 'string') {
		packageJson.bin = modifyLoaderInString(packageJson.bin);
	}
}
function modifyLoaderInString(str: string): string {
	if (!str.startsWith('./')) {
		str = `./${str}`;
	}
	if (str.startsWith('./loader/')) {
		if (str.endsWith('.devel.js')) {
			logger.log`从 ${str} 删除 .devel.js 后缀`;
			str = str.replace(/\.devel\.js$/, '.js');
		} else {
			logger.log`替换 ${str} 为 ./lib`;
			str = str.replace(/^\.\/loader/, './lib');
		}
	}
	return str;
}

/**
 * 写入npmignore和npmrc
 */
export function writeNpmFiles() {
	const source = import.meta.resolve('@build-script/single-dog-asset/package/npmignore');

	cpSync(fileURLToPath(source), resolve(projectPath, '.npmignore'));

	const file = resolve(monorepoRoot, isPublish ? '.npmrc-publish' : '.npmrc');
	cpSync(file, resolve(projectPath, '.npmrc'));
}
