import { readFileSync } from 'fs-extra';

export type IDependencyMap = Record<string, any>;

/**
 * convert dependencies to { name: true }
 * @param path to a package.json
 */
export function createDependencies(path: string): IDependencyMap {
	const text = readFileSync(path, 'utf-8');
	const pkg = JSON.parse(text);
	const deps: IDependencyMap = {};

	if (pkg.dependencies) {
		for (const i of Object.keys(pkg.dependencies)) {
			deps[i] = true;
		}
	}
	if (pkg.peerDependencies) {
		for (const i of Object.keys(pkg.peerDependencies)) {
			deps[i] = true;
		}
	}
	return deps;
}
