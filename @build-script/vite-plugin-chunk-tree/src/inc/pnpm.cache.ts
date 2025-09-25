import { linux_case } from '@idlebox/common';
import { md5 } from '@idlebox/node';
import { execaSync } from 'execa';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectRoot } from './constants.js';
import { flatten } from './flatten.js';
import type { PnpmDependTree, PnpmListItem } from './pnpm.lib.js';
import { getPackageList, type IPnpmPackage } from './pnpm.project-list.js';

class CacheItem {
	readonly packageName: string;
	readonly packageRoot: string;
	dependencies: PnpmDependTree;
	private readonly cacheFile: string;
	private _id: string;

	constructor({ name, path }: IPnpmPackage) {
		this.packageName = name;
		this.cacheFile = resolve(cacheDir, `${linux_case(name).replace('@', '')}.json`);
		this.packageRoot = path;
		this.dependencies = {};
		try {
			const { id, dependencies } = JSON.parse(readFileSync(this.cacheFile, 'utf-8'));
			this.dependencies = dependencies;
			this._id = id;
		} catch {
			this._id = '';
		}
	}

	isOutdated() {
		const wantId = this.recalculateId();
		return wantId !== this._id;
	}

	private recalculateId() {
		const pkgJson = resolve(this.packageRoot, 'package.json');
		const content = JSON.parse(readFileSync(pkgJson, 'utf-8'));
		return md5(JSON.stringify(content.dependencies || {}));
	}

	update(newDeps: PnpmDependTree) {
		this.dependencies = newDeps;
		this._id = this.recalculateId();
		const text = JSON.stringify({ id: this._id, dependencies: this.dependencies }, null, '\t');
		writeFileSync(this.cacheFile, `${text}\n`, { encoding: 'utf-8' });
	}

	get id() {
		return this._id;
	}
}

// console.log('[cache] project root:', projectRoot);
const cacheDir = resolve(projectRoot, 'node_modules/.cache');
if (!existsSync(cacheDir)) {
	mkdirSync(cacheDir, { recursive: true });
}

export const storage = new Map</* packageName= */ string, CacheItem>();
export function checkAndUpdateCache() {
	initializeCache();

	for (const pkg of getPackageList()) {
		if (storage.get(pkg.name)?.isOutdated()) {
			rebuild();
			break;
		}
	}

	flatten(Array.from(storage.values().map((item) => item.dependencies)));
}

function initializeCache() {
	for (const pkg of getPackageList()) {
		if (storage.has(pkg.name)) continue;

		const element = new CacheItem(pkg);
		storage.set(pkg.name, element);
	}
}

function rebuild() {
	console.log('[cache] 正在重建依赖树缓存...');
	const full_resolve = execaSync({
		stdio: ['ignore', 'pipe', 'inherit'],
		encoding: 'utf8',
		cwd: projectRoot,
	})`pnpm -r list --prod --depth Infinity --json`;
	const all = JSON.parse(full_resolve.stdout) as PnpmListItem[];

	for (const pkg of all) {
		if (!pkg.name) continue;

		const cache = storage.get(pkg.name);
		if (!cache) {
			throw new Error(`无法识别的包 ${pkg.name}`);
		}

		cache.update(pkg.dependencies || {});
	}
}
