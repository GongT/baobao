import type { IPackageJson } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { inc } from 'semver';
import { logger } from '../functions/log.js';

function sort(object: any): any {
	if (typeof object !== 'object') {
		// Not to sort the array
		return object;
	}
	if (Array.isArray(object)) {
		return object.sort();
	}
	const keys = Object.keys(object);
	keys.sort();
	const newObject: any = {};
	for (const key of keys) {
		newObject[key] = sort(object[key]);
	}
	return newObject;
}

export async function makePackageJsonOrderConsistence(root: string) {
	const filepath = resolve(root, 'package.json');
	const data = JSON.parse(await readFile(filepath, 'utf-8'));
	const json = sort(data);
	await writeFile(filepath, JSON.stringify(json, null, 2), 'utf-8');

	delete pkgCache[filepath];
}

const pkgCache: Record<string, IPackageJson> = {};
export async function cachedPackageJson(path: string) {
	const exists = pkgCache[path];
	if (exists) {
		return exists;
	}

	const data = await loadJsonFile(path);
	pkgCache[path] = data;
	return data;
}

export async function increaseVersion(pkg: IPackageJson, current: string) {
	const v = inc(current, 'patch');
	if (!v) {
		throw new Error(`无法为"${pkg.name}"当前版本"${current}"增加版本号`);
	}
	pkg.version = v;
	logger.log('新版本: %s', pkg.version);
	const ch = await writeJsonFileBack(pkg);
	logger.debug('package.json回写: %s', ch);
}
