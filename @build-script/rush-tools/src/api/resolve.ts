import { DeepReadonly } from '@idlebox/common';
import { DepGraph } from 'dependency-graph';
import { RunQueue } from '../common/runnerQueue';
import { ICProjectConfig, IProjectConfig } from './limitedJson';
import { RushProject } from './rushProject';

export interface IProjectCallback {
	(project: DeepReadonly<IProjectConfig>): Promise<void>;
}

export interface IGraphAttachedData {
	readonly packageJson: any;
	readonly hasBuildScript: boolean;
	readonly shouldPublish: boolean;
	readonly project: ICProjectConfig;
	readonly dedupProjects: readonly string[];
}

export function createDeps(rushProject: RushProject) {
	const dep = new DepGraph<IGraphAttachedData>();

	for (const project of rushProject.projects) {
		const packageJson = rushProject.packageJsonContent(project)!;
		dep.addNode(project.packageName, {
			project,
			packageJson,
			shouldPublish: rushProject.isProjectPublic(project),
			hasBuildScript: !!packageJson.scripts?.build,
			dedupProjects: project.decoupledLocalDependencies ?? [],
		});
	}

	for (const { packageName } of rushProject.projects) {
		const deps = rushProject.packageDependency(packageName, { removeCyclic: true, includingRuntime: true });
		for (const name of deps) {
			dep.addDependency(packageName, name);
		}
	}
	return dep;
}

export function overallOrder(rushProject = new RushProject()): DeepReadonly<IProjectConfig>[] {
	const dep = createDeps(rushProject);
	return dep.overallOrder().map((name) => {
		return dep.getNodeData(name).project;
	});
}

function mapData(deps: DepGraph<IGraphAttachedData>, list: string[] = deps.overallOrder()) {
	return list.map((e) => {
		return deps.getNodeData(e);
	});
}

export interface IBuildProjectOptions {
	rushProject?: RushProject;
	concurrent?: number;
}
export async function buildProjects(builder: IProjectCallback): Promise<void>;
export async function buildProjects(opts: IBuildProjectOptions, builder: IProjectCallback): Promise<void>;
export async function buildProjects(
	opts_: IBuildProjectOptions | IProjectCallback,
	builder_?: IProjectCallback,
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
	const overall = mapData(dep);

	const q = new RunQueue(builder, concurrent);
	for (const { project } of overall) {
		const sub = mapData(dep, dep.dependenciesOf(project.packageName));
		q.register(
			project.packageName,
			project,
			sub.map((e) => e.project.packageName),
		);
	}

	await q.run();
}

// function isTypingsProvider(packagePath: string) {
// 	const data = loadJsonFileSync(packagePath);
// 	if (data.typings || data.types) {
// 		return true;
// 	}
// 	if (data.main) {
// 		const f = resolve(packagePath, '..', data.main);
// 		if (pathExistsSync(f.replace(/\..+$/, '.d.ts'))) {
// 			return true;
// 		}
// 		if (pathExistsSync(f + '.d.ts')) {
// 			return true;
// 		}
// 	}
// 	if (pathExistsSync(resolve(packagePath, '../index.d.ts'))) {
// 		return true;
// 	}

// 	return false;
// }
