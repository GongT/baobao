import { RushProject } from './rushProject';
import { DepGraph } from 'dependency-graph';
import { Immutable } from './deepReadonly';
import { IProjectConfig } from './limitedJson';

export function resolveRushProjectBuildOrder(path: string = process.cwd()): Immutable<IProjectConfig[]> {
	const rushProject = new RushProject(path);
	const dep = new DepGraph();

	for (const { packageName } of rushProject.projects) {
		dep.addNode(packageName);
	}
	for (const { packageName } of rushProject.projects) {
		const deps = rushProject.packageDependency(packageName);
		for (const name of deps) {
			dep.addDependency(packageName, name);
		}
	}

	return dep.overallOrder().map((name) => rushProject.getPackageByName(name)!);
}
