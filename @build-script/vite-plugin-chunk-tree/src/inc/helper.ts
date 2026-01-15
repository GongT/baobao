import { getNodes } from './flatten.js';
import type { PnpmDependTree } from './pnpm.lib.js';

export function pickupPackage(id: string | RegExp, registry: Set<string>, excludes?: Set<string>) {
	const items = getNodes(id);
	if (!Object.keys(items).length) {
		// 没有任何项目依赖它
		return false;
	}

	for (const [id, tree] of Object.entries(items)) {
		addToSet(id, registry, excludes);
		for (const key of Object.keys(flattenDependencies(tree))) {
			addToSet(key, registry, excludes);
		}
	}
	return true;
}

function flattenDependencies(deps: PnpmDependTree, result: Record<string, string> = {}) {
	for (const [name, info] of Object.entries(deps)) {
		if (!result[name]) {
			result[name] = info.version;
			if (info.dependencies) {
				flattenDependencies(info.dependencies, result);
			}
		}
	}
	return result;
}

function addToSet(name: string, registry: Set<string>, excludes?: Set<string>) {
	if (!excludes) {
		registry.add(name);
		return;
	}
	if (!excludes.has(name)) {
		registry.add(name);
		excludes.add(name);
	}
}
