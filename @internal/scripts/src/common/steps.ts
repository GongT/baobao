/** biome-ignore-all lint/performance/useTopLevelRegex: <explanation> */
import { type IExportMap } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentProject, monorepoRoot } from './constants.js';
import { isPublish } from './constants.publish.js';
import { getExportsField, packageJson } from './package-json.js';

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
	const exports = getExportsField();
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
	const currentPackagePath = resolve(currentProject, 'package.json');
	const exports = getExportsField();
	if (!exports['.']) {
		logger.fatal`long<${currentPackagePath}> exports['.'] 不存在`;
		return;
	}

	const main = exports['.'].default;
	if (main) {
		logger.log`将exports[.]同步到main`;
		if (packageJson.main) {
			logger.fatal`long<${currentPackagePath}> 中存在main字段，应该删除`;
		}
		packageJson.main = main;
	}
}

/**
 * 删除exports和bin里关于loader的内容
 */
export function removeLoaderFromExportsAndBin() {
	const exports = getExportsField();
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

	cpSync(fileURLToPath(source), resolve(currentProject, '.npmignore'));

	const file = resolve(monorepoRoot, isPublish ? '.npmrc-publish' : '.npmrc');
	cpSync(file, resolve(currentProject, '.npmrc'));
}
