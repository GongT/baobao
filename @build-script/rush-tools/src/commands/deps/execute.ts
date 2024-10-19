import { DepGraph } from 'dependency-graph';
import { createDeps, IGraphAttachedData, RushProject } from '../../api';
import type { ArgOf } from '../../common/args.js';

export async function runDeps({}: ArgOf<typeof import('./arguments')>) {
	const rush = new RushProject();
	const graph = createDeps(rush);

	// const maxDepth = parseInt(optionalArgument('depth') ?? '0') || Infinity;

	const projects = rush.projects;

	const max = projects.length.toFixed(0);
	for (const [index, project] of projects.entries()) {
		const f = index.toFixed(0).padStart(max.length, ' ');
		process.stdout.write(`[${f}/${max}]`);

		printOne(project.packageName, graph, '', []);
	}
}

function printOne(name: string, graph: DepGraph<IGraphAttachedData>, indent: string, walked: readonly string[]) {
	const deps = graph.directDependenciesOf(name);
	const data = graph.getNodeData(name);
	let options = [];

	if (walked.length === 0) {
		if (!data.hasBuildScript) {
			options.push('\x1B[2m[no-build]\x1B[0m');
		}
		options.push(data.shouldPublish ? '\x1B[2;38;5;10m[public]\x1B[0m' : '\x1B[2;38;5;11m[private]\x1B[0m');
	}

	if (deps.length === 0) {
		console.log('%s* %s', indent, name, options.join(' '));
		return;
	}
	console.log('%s+ %s', indent, name, options.join(' '));
	for (const sub of deps) {
		if (data.dedupProjects.includes(sub)) {
			console.log('%s  \x1B[38;5;9m* %s [dedup]\x1B[0m', indent, sub);
		} else if (walked.includes(sub)) {
			console.log('%s  \x1B[38;5;9m! %s\x1B[0m', indent, sub);
		} else {
			printOne(sub, graph, indent + '  ', [...walked, name]);
		}
	}
}
