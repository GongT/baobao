import type { PnpmDependTree } from './pnpm.lib.js';

interface IWarn {
	warned: boolean;
	firstSeen: string;
	versions: Set<string>;
}
const conflictVersions = new Map<string, IWarn>();

let everythingCache: Record<string, PnpmDependTree> = {};
export function flatten(arr: readonly PnpmDependTree[]) {
	everythingCache = {};
	conflictVersions.clear();

	for (const projDeps of arr) {
		walk(projDeps);
	}
}

function walk(deps: PnpmDependTree) {
	for (const [name, info] of Object.entries(deps)) {
		if (isVersion(info.version)) {
			const conflict = conflictVersions.get(name);
			if (conflict) {
				if (info.version !== conflict.firstSeen && !conflict.warned) {
					conflict.warned = true;
					// console.warn(`依赖包 "${name}" 存在多个版本: ${conflict.firstSeen} <-> ${info.version}`);
				} else {
					conflict.versions.add(info.version);
				}
			} else {
				conflictVersions.set(name, { warned: false, firstSeen: info.version, versions: new Set([info.version]) });
			}
		}

		everythingCache[name] = info.dependencies || empty;
		if (info.dependencies) {
			walk(info.dependencies);
		}
	}
}

function isVersion(version: string) {
	if (version.startsWith('link:')) return false;
	if (version.startsWith('file:')) return false;
	if (version.startsWith('workspace:')) return false;
	return true;
}

const empty: PnpmDependTree = {};

export function getNode(name: string): PnpmDependTree | undefined {
	// console.log(everythingCache)
	return everythingCache[name];
}

export function getNodes(namesReg: RegExp | string) {
	if (typeof namesReg === 'string') {
		const i = everythingCache[namesReg];
		return i ? { [namesReg]: i } : {};
	}
	const result: Record<string, PnpmDependTree> = {};
	for (const [name, value] of Object.entries(everythingCache)) {
		if (namesReg.test(name)) {
			result[name] = value;
		}
	}
	return result;
}

export function hasMultipleVersion(name: string) {
	return (conflictVersions.get(name)?.versions.size ?? 0) > 1;
}
