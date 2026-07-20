import { logger } from '@idlebox/cli';
import type { IPackageJson } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { inc } from 'semver';

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
	const data: IPackageJson = JSON.parse(await readFile(filepath, 'utf-8'));
	delete (data as any).devDependencies;

	rewritePackageVersions(data.dependencies);
	rewritePackageVersions(data.optionalDependencies);
	rewritePackageVersions(data.peerDependencies);

	const json = sort(data);
	await writeFile(filepath, JSON.stringify(json, null, 2), 'utf-8');

	delete pkgCache[filepath];
	return json;
}

const pkgCache: Record<string, IPackageJson> = {};
export async function cachedPackageJson(path: string): Promise<IPackageJson> {
	const exists = pkgCache[path];
	if (exists) {
		return exists;
	}

	const data = await loadJsonFile(path);
	pkgCache[path] = data;
	return data;
}

export async function increaseVersion(pkg: IPackageJson, current: string, type: 'major' | 'minor' | 'patch' = 'patch') {
	const v = inc(current, type);
	if (!v) {
		throw new Error(`无法为"${pkg.name}"当前版本"${current}"增加版本号`);
	}
	pkg.version = v;
	logger.debug`新版本: ${pkg.version}`;
	const ch = await writeJsonFileBack(pkg);
	logger.debug`package.json回写: ${ch}`;
	return v;
}

const caretVersion = /^\^(\d+\.\d+)\.\d+/;
function rewritePackageVersions(deps: Record<string, string>) {
	if (!deps) return;

	for (const [k, v] of Object.entries(deps)) {
		const m = caretVersion.exec(v);
		if (m) {
			deps[k] = `^${m[1]}.0`;
		} else {
			if (v === 'latest') continue;
			logger.warn`依赖 ${k} 的版本号 ${v} 不符合预期的 ^X.Y.Z 格式，无法重写为 ^X.Y.0`;
		}
	}
}
