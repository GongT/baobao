import { loadJsonFileSync } from '@idlebox/node-json-edit';
import { DepGraph } from 'dependency-graph';
import { pathExistsSync } from 'fs-extra';
import { resolve } from 'path';
import { Immutable } from './deepReadonly';
import { IProjectConfig } from './limitedJson';
import { RushProject } from './rushProject';
import { RunQueue } from '../common/runnerQueue';

export interface IProjectCallback {
	(project: Immutable<IProjectConfig>): Promise<void>;
}

export async function buildProjects(builder: IProjectCallback, path: string = process.cwd()): Promise<void> {
	const rushProject = new RushProject(path);
	const dep = new DepGraph<boolean>();

	for (const { packageName } of rushProject.projects) {
		dep.addNode(packageName, false);
	}
	for (const { packageName } of rushProject.projects) {
		const deps = rushProject.packageDependency(packageName, { development: true, removeCyclic: true });
		for (const name of deps) {
			dep.addDependency(packageName, name);
		}

		const runtimeDeps = rushProject.packageDependency(packageName, { development: false, removeCyclic: true });
		for (const name of runtimeDeps) {
			if (isTypingsProvider(rushProject.packageJsonPath(name)!)) {
				dep.addDependency(packageName, name);
			}
		}
	}

	const overall = dep.overallOrder().map((name) => rushProject.getPackageByName(name)!);

	const q = new RunQueue(builder);
	for (const proj of overall) {
		q.register(proj.packageName, proj, dep.dependenciesOf(proj.packageName));
	}

	await q.run();
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
