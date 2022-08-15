import { resolve } from 'path';
import { DeepReadonly } from '@idlebox/common';
import { loadJsonFileSync } from '@idlebox/node-json-edit';
import { DepGraph } from 'dependency-graph';
import { pathExistsSync } from 'fs-extra';
import { RunQueue } from '../common/runnerQueue';
import { IProjectConfig } from './limitedJson';
import { RushProject } from './rushProject';

export interface IProjectCallback {
	(project: DeepReadonly<IProjectConfig>): Promise<void>;
}

function createDeps(rushProject: RushProject) {
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
	return dep;
}

export function overallOrder(rushProject = new RushProject()): DeepReadonly<IProjectConfig>[] {
	const dep = createDeps(rushProject);
	return dep.overallOrder().map((name) => rushProject.getPackageByName(name)!);
}

export interface IBuildProjectOptions {
	rushProject?: RushProject;
	concurrent?: number;
}
export async function buildProjects(builder: IProjectCallback): Promise<void>;
export async function buildProjects(opts: IBuildProjectOptions, builder: IProjectCallback): Promise<void>;
export async function buildProjects(
	opts_: IBuildProjectOptions | IProjectCallback,
	builder_?: IProjectCallback
): Promise<void> {
	const { opts, builder } = ((): { opts: IBuildProjectOptions; builder: IProjectCallback } => {
		if (builder_) {
			return { opts: opts_ as IBuildProjectOptions, builder: builder_ };
		} else {
			return { opts: {}, builder: opts_ as IProjectCallback };
		}
	})();

	const { rushProject = new RushProject(), concurrent = 4 } = opts;

	const dep = createDeps(rushProject);
	const overall = dep.overallOrder().map((name) => rushProject.getPackageByName(name)!);

	const q = new RunQueue(builder, concurrent);
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
