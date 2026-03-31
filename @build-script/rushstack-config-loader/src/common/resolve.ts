import { isModuleResolutionError, isNodeError, NodeErrorCode } from '@idlebox/errors';
import { resolve as importResolve } from 'import-meta-resolve';
import { existsSync } from 'node:fs';
import { findPackageJSON } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 根据packageName和parentUrl解析出packageName的包根目录
 * 先尝试直接用import.meta.resolve，如果失败了再用文件系统的方式找package.json
 * 只有当两种方式都找不到时才返回undefined
 */
export function resolvePackageRoot(packageName: string, parentUrl: string): string | undefined {
	try {
		// 首先直接访问
		return dirname(importResolve(`${packageName}/package.json`, parentUrl));
	} catch (e: any) {
		if (isNodeError(e)) {
			if (e.code === NodeErrorCode.ERR_PACKAGE_PATH_NOT_EXPORTED) {
				// ERR_PACKAGE_PATH_NOT_EXPORTED: 没有列出 ./package.json，则需要用文件系统的方式去找package.json
				return findByFileSystem(packageName, parentUrl);
			} else if (isModuleResolutionError(e)) {
				// 找不到模块
				return undefined;
			}
			// 由import以外原因导致的错误，例如磁盘读取失败
		} // else: 完全未知的错误，例如语法错误
		throw e;
	}
}

function findByFileSystem(packageName: string, parentUrl: string) {
	const parentPackage = parentUrl.endsWith('package.json') ? parentUrl : findPackageJSON(parentUrl);
	if (!parentPackage) {
		throw new TypeError(`Cannot find package.json for ${parentUrl}`);
	}

	let cursor = fileURLToPath(parentPackage);
	while (!isRoot(cursor)) {
		const nm = resolve(cursor, '../node_modules');
		const childShouldAt = resolve(nm, packageName, 'package.json');
		if (existsSync(childShouldAt)) {
			return `file://${dirname(childShouldAt)}`;
		}
		cursor = resolve(cursor, '../');
	}

	throw new TypeError(`package ${packageName} definitely has a package.json but cannot be found in node_modules (${parentPackage})`);
}

const isRoot = process.platform === 'win32' ? (path: string) => path === dirname(path) : (path: string) => path === '/';
