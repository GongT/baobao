import { createWorkspace } from '@build-script/monorepo-lib';
import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';

type NamePair = readonly [string, string];
const outerScope: string[] = [];
const scopes = new Map<string, string[]>();

export async function runDot() {
	const reverse = argv.flag(['--reverse', '-r']) > 0;
	const prodOnly = argv.flag(['--prod', '-P']) > 0;
	const devOnly = argv.flag(['--dev', '-D']) > 0;

	// const packages = argv.range(0)

	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const workspace = await createWorkspace();
	await workspace.decoupleDependencies();

	const projects = await workspace.listPackages();
	logger.debug`workspace: ${projects.length} packages.`;
	for (const project of projects) {
		if (!project.name) continue;
		if (ignoreName(project.name)) continue;

		const [scopeName, nodeName] = split(project.name);

		const all_deps = new Set<string>();
		if (!devOnly) {
			for (const [dep, version] of Object.entries(project.packageJson.dependencies ?? {})) {
				if (!version.startsWith('workspace:') || ignoreName(dep)) continue;
				all_deps.add(dep);
			}
		}
		if (!prodOnly) {
			for (const [dep, version] of Object.entries(project.packageJson.devDependencies ?? {})) {
				if (!version.startsWith('workspace:') || ignoreName(dep)) continue;
				all_deps.add(dep);
			}
		}

		scope(scopeName).push(`  "${nodeName}" [label="${nodeName}\\n依赖: ${osize(project.packageJson.devDependencies)}+${osize(project.packageJson.dependencies)}"];`);
		for (const dep of all_deps) {
			const styles = [];
			if (Object.hasOwn(project.packageJson.devDependencies ?? {}, dep)) {
				styles.push('style=dashed', 'color=darkorange3');
			} else {
				styles.push('color=darkorchid3');
			}

			if (reverse) {
				connect(split(dep), split(project.name), styles);
			} else {
				connect(split(project.name), split(dep), styles);
			}
		}
	}

	const output: string[] = ['digraph Tree {', 'splines=ortho;', 'node [shape=rect,style=filled,fillcolor=darkolivegreen3];'];
	for (const lines of scopes.values()) {
		output.push(...lines, '}');
	}
	output.push(...outerScope);
	output.push('}');

	console.log(output.join('\n'));
}

function split(name: string): NamePair {
	name = name.replace(/-/g, '_');
	if (name.startsWith('@')) {
		const n = name.split('/');
		return [n[0].slice(1), n[1]] as const;
	} else {
		return ['standalone', name] as const;
	}
}
function scope(scopeName: string) {
	const arr = scopes.get(scopeName);
	if (arr) return arr;
	const newArr: string[] = [`subgraph "cluster_${scopeName}" {`, `fillcolor=cornsilk;`, `style=filled;`, `label = "Scope @${scopeName}";`];
	scopes.set(scopeName, newArr);
	return newArr;
}
function connect(from: NamePair, to: NamePair, styles: string[] = []) {
	if (from[0] === to[0]) {
		scope(from[0]).push(`  "${from[1]}" -> "${to[1]}" [${styles.join(',')}];`);
	} else {
		styles.push(`ltail="cluster_${from[0]}"`, `lhead="cluster_${to[0]}"`);
		outerScope.push(`  "${from[1]}" -> "${to[1]}" [${styles.join(',')}];`);
	}
}

function ignoreName(_name: string) {
	return false;
}

function osize(objects: object) {
	if (!objects) return 0;
	return Object.keys(objects).length;
}
