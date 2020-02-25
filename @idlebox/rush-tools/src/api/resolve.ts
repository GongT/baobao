import { RushProject } from './rushProject';
import { DepGraph } from 'dependency-graph';
import { Immutable } from './deepReadonly';
import { IProjectConfig } from './limitedJson';
import { loadJsonFileSync } from '@idlebox/node-json-edit';
import { resolve } from 'path';
import { pathExistsSync } from 'fs-extra';

export function resolveRushProjectBuildOrder(path: string = process.cwd()): Immutable<IProjectConfig[]> {
	const rushProject = new RushProject(path);
	const dep = new DepGraph();

	for (const { packageName } of rushProject.projects) {
		dep.addNode(packageName);
	}
	for (const { packageName } of rushProject.projects) {
		const deps = rushProject.packageDependency(packageName, { development: true });
		const runtimeDeps = rushProject.packageDependency(packageName, { development: false });
		for (const name of deps) {
			dep.addDependency(packageName, name);
		}
		for (const name of runtimeDeps) {
			if (isTypingsProvider(rushProject.packageJsonPath(name)!)) {
				dep.addDependency(packageName, name);
			}
		}
	}

	return dep.overallOrder().map((name) => rushProject.getPackageByName(name)!);
}

function isTypingsProvider(packagePath: string) {
	const data = loadJsonFileSync(packagePath);
	if (data.typings) {
		return true;
	}
	if (data.main) {
		const f = resolve(packagePath, '..', data.main);
		if (pathExistsSync(f.replace(/\..+$/, '.d.ts'))) {
			return true;
		}
		if (pathExistsSync(f + '.d.ts')) {
			return true;
		}
	}
	if (pathExistsSync(resolve(packagePath, '../index.d.ts'))) {
		return true;
	}

	return false;
}
