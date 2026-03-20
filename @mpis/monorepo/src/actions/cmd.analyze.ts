import type { IPackageInfo, MonorepoWorkspace } from '@build-script/monorepo-lib';
import type { ISubArgsReaderApi } from '@idlebox/args';
import { argv } from '@idlebox/args/default';
import type { DeepReadonly, IPackageJson } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { createMonorepoObject } from '../common/workspace.js';

type NamePair = readonly [string, string];
const outerScope: string[] = [];
const scopes = new Map<string, string[]>();

export async function runAnalyze(cmd: ISubArgsReaderApi) {
	const packageName = cmd.at(0);
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}
	if (!packageName) {
		logger.error`包名参数必须指定。`;
		return shutdown(1);
	}

	const repo = await createMonorepoObject();
	await repo._finalize();

	const pkg = await repo.workspace.getPackage(packageName);
	if (!pkg) {
		logger.error`项目中没有找到 "${packageName}"。`;
		return shutdown(1);
	}

	const { node } = makeNode(pkg.packageJson, '');
	await walk(repo.workspace, pkg, node);

	const scopesOut: string[] = [];
	for (const [scopeName, lines] of scopes.entries()) {
		scopesOut.push(
			`// scope ---- ${scopeName}`,
			`subgraph "cluster_${scopeName}" {`,
			`\tfillcolor=cornsilk;`,
			`\tstyle=filled;`,
			`\tlabel = "Scope @${scopeName}";`,
			...lines.map((e) => `\t${e}`),
			`}`,
			`// end   ---- ${scopeName}`,
			'',
		);
	}

	console.log(`digraph Tree {
	splines=ortho;
	node [shape=rect,style=filled,fillcolor=darkolivegreen3];
	${scopesOut.join('\n\t')}

	// outer scope ----
	${outerScope.join('\n\t')}
}`);
}

let guid = 1;
const nodesRegistry = new Map<string, NamePair>();
function makeNode(packageJson: DeepReadonly<IPackageJson>, scopeName: string) {
	const registryKey = `${scopeName}:${packageJson.name}`;
	const exist = nodesRegistry.get(registryKey);
	if (exist)
		return {
			exists: true,
			node: exist,
		};

	const deps = getDeps(packageJson);
	const localNum = deps.filter((d) => d.local).length;
	const devNum = deps.filter((d) => d.dev).length;
	const prodNum = deps.filter((d) => !d.dev).length;
	const name = `node_${guid++}`;
	const node = `"${name}" [label="${packageJson.name}\\n依赖: ${devNum}+${prodNum} (${localNum})",style=filled,fillcolor=ghostwhite];`;

	if (scopeName) {
		scope(scopeName).unshift(node);
	} else {
		outerScope.push(node);
	}
	const r: NamePair = [scopeName, name];
	nodesRegistry.set(registryKey, r);
	return { exists: false, node: r };
}
function getDeps(packageJson: DeepReadonly<IPackageJson>) {
	type Dep = { name: string; local: boolean; dev: boolean };
	const r: Dep[] = [];
	for (const [dep, version] of Object.entries(packageJson.dependencies ?? {})) {
		const local = version.startsWith('workspace:');
		r.push({ name: dep, local, dev: false });
	}
	for (const [dep, version] of Object.entries(packageJson.devDependencies ?? {})) {
		const local = version.startsWith('workspace:');
		r.push({ name: dep, local, dev: true });
	}
	return r;
}

async function walk(context: MonorepoWorkspace, pkg: IPackageInfo, parent: NamePair, level = 1) {
	const tabs = '  '.repeat(level);

	logger.info`${tabs}Analyzing ${pkg.name}...`;
	for (const dep of pkg.dependencies) {
		const isDev = Object.hasOwn(pkg.packageJson.devDependencies ?? {}, dep);
		logger.verbose`${tabs}   * ${dep} (${isDev ? ', dev' : ''})`;

		const styles = [];
		if (isDev) {
			styles.push('style=dashed', 'color=darkorange3');
		} else {
			styles.push('color=darkorchid3');
		}

		const depPkg = await context.getPackage(dep);
		if (!depPkg) {
			throw new Error(`${pkg.name} 中有未找到的依赖 ${dep}`);
		}

		const { node: child, exists } = makeNode(depPkg.packageJson, `level_${level}`);
		connect(parent, child, styles);

		if (!exists) {
			await walk(context, depPkg, child, level + 1);
		}
	}
}

function scope(scopeName: string) {
	if (!scopeName) throw new Error('scopeName is empty');
	const arr = scopes.get(scopeName);
	if (arr) return arr;
	const newArr: string[] = [];
	scopes.set(scopeName, newArr);
	return newArr;
}
function connect(from: NamePair, to: NamePair, styles: string[] = []) {
	if (from[0] && from[0] === to[0]) {
		scope(from[0]).push(`\t"${from[1]}" -> "${to[1]}" [${styles.join(',')}];`);
	} else {
		if (from[0]) {
			styles.push(`ltail="cluster_${from[0]}"`);
		}
		if (to[0]) {
			styles.push(`lhead="cluster_${to[0]}"`);
		}
		outerScope.push(`"${from[1]}" -> "${to[1]}" [${styles.join(',')}];`);
	}
}
