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

const caretVersion = /^\^(\d+)\.(\d+)\.(\d+)/;
const tildeVersion = /^~(\d+\.\d+)\.\d+/;
const compareVersion = /^([><]=?)(\d+\.\d+)\.\d+/;
const exactVersion = /^\d+\.\d+\.\d+/;
/**
 * 处理依赖版本号
 * 根据semver规范要求，实际结果要大于等于当前值
 * 通过取消此约束来减少部分无意义的版本更新
 */
function rewritePackageVersions(deps: Record<string, string>) {
	if (!deps) return;

	for (const [k, v] of Object.entries(deps)) {
		if (v === 'latest' || v === '*') continue;
		if (compareVersion.test(v) || exactVersion.test(v)) continue;

		const m = caretVersion.exec(v);
		if (m) {
			deps[k] = relaxCaretVersion(m);
			continue;
		}

		const m2 = tildeVersion.exec(v);
		if (m2) {
			deps[k] = relaxTildeVersion(m2);
			continue;
		}

		logger.warn`依赖 ${k} 的版本号 ${v} 不符合预期格式，无法重写`;
	}
}

/**
 * tilde version: 最后一位可以自由变化
 * 对于符合 ~X.Y.Z 格式的版本号，最后一位可以自由变化，前两位保持不变
 */
function relaxTildeVersion(versions: RegExpExecArray): string {
	return `~${versions[1]}.0`;
}

/**
 * caret version: 首个非0的数字保留，后续部分均可自由变化
 * 对于符合 ^X.Y.Z 格式的版本号，首个非0的数字保留，后续部分置为0
 * 如果X、Y都为0，则返回 ^0.0.0
 */
function relaxCaretVersion(versions: RegExpExecArray): string {
	let v = '^';
	if (versions[1] === '0') {
		// X=0
		v += '0.';
		if (versions[2] === '0') {
			// Y=0 -> 0.0.0
			v += '0';
		} else {
			// Y != 0 -> X.Y.0
			v += versions[2];
		}
		v += '.0';
	} else {
		// X != 0 -> X.0.0
		v += versions[1];
		v += '.0.0';
	}

	return v;
}
