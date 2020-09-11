import { readFileSync } from 'fs-extra';

export type IDependencyMap = Record<string, any>;

/**
 * convert dependencies to { name: true }
 * @param path to a package.json
 */
export function createDependencies(path: string): IDependencyMap {
	const text = readFileSync(path, 'utf-8');
	const pkg = JSON.parse(text);

	if (!pkg.dependencies) return {};

	const deps: IDependencyMap = {};
	for (const i of Object.keys(pkg.dependencies)) {
		deps[i] = true;
	}
	return deps;
}
