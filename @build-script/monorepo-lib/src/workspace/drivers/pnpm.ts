import { normalizePath, relativePath } from '@idlebox/node';
import { resolve } from 'node:path';
import { execJson } from '../../common/exec.js';
import { importPackageJson } from '../../common/import-package-json.js';
import type { IPackageInfoRW } from '../common/types.js';

interface IPnpmListReturnElement {
	name: string;
	version: string;
	path: string;
	private: boolean;
}

export async function pnpmListProjects(projectRoot: string) {
	const ret: IPackageInfoRW[] = [];
	const defs: IPnpmListReturnElement[] = await execJson(['pnpm', 'recursive', 'ls', '--depth=-1', '--json'], projectRoot);
	const allNames = defs.map((d) => d.name);
	for (const { name, path } of defs) {
		const pkgFile = resolve(path, 'package.json');
		const pkg = await importPackageJson(pkgFile);
		const allDep = {};
		if (pkg.dependencies) {
			Object.assign(allDep, pkg.dependencies);
		}
		if (pkg.devDependencies) {
			Object.assign(allDep, pkg.devDependencies);
		}
		ret.push({
			absolute: normalizePath(path),
			relative: relativePath(projectRoot, path),
			name: name,
			dependencies: filter(allNames, pkg.dependencies),
			devDependencies: filter(allNames, allDep),
			packageJson: pkg,
		});
	}
	return ret;
}

function filter(localNames: string[], depMap: Record<string, string>) {
	const ret: string[] = [];
	if (!depMap) {
		return ret;
	}
	for (const name of localNames) {
		const ver = depMap[name];
		if (!ver) continue;

		if (ver.startsWith('workspace:')) {
			ret.push(name);
		}
	}
	return ret;
}
