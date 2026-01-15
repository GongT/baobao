import { createWorkspace, type MonorepoWorkspace } from '@build-script/monorepo-lib';
import { argv } from '@idlebox/cli';
import { CommandDefine } from '@idlebox/cli';
import type { DeepReadonly, IPackageJson } from '@idlebox/common';
import { ensureLinkTargetSync } from '@idlebox/ensure-symlink';
import { logger } from '@idlebox/cli';
import { relativePath } from '@idlebox/node';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '将monorepo中每个项目的bins连接到当前项目的 ./node_modules/.bin';
	protected override readonly _help = '存在bin同名时，monorepo项目优先于npm包';
	protected override readonly _arguments = {
		'--from': {
			usage: true,
			flag: false,
			description: '将<value>视为各个项目的直接依赖 (必须是至少一个项目的依赖，否则找不到)',
		},
		'--transparent': {
			flag: false,
			description: '将<value>的所有直接依赖视为此项目的直接依赖',
		},
		'--recursive': {
			usage: true,
			flag: true,
			description: '在每个项目中运行，而非当前项目',
		},
	};
}

interface BinaryDefine {
	readonly name: string;
	readonly absolutePath: string;
}
interface IJobContext {
	readonly packageRoot: string;
	readonly deps: readonly BinaryDefine[];
	readonly globalDeps: readonly BinaryDefine[];
	readonly monorepo: readonly BinaryDefine[];
}

export async function main() {
	const recursiveMode = argv.flag(['--recursive']) > 0;

	const workspace = await createWorkspace();

	const localPackages = [];
	const projectList = await workspace.listPackages();
	for (const pkg of projectList) {
		if (!pkg.packageJson.name) continue;
		localPackages.push(pkg.packageJson.name);
	}

	const additionalPackages = new Set(argv.multiple(['--from']));
	for (const projectName of argv.multiple(['--transparent'])) {
		const proj = await workspace.getPackage(projectName);
		if (!proj) {
			throw new Error(`missing transparent project: ${projectName}`);
		}
		for (const item of depNames(proj.packageJson)) {
			additionalPackages.add(item);
		}
	}

	for (const name of additionalPackages) {
		if (await workspace.getPackage(name)) {
			throw new Error('--from can not be a local package');
		}
	}

	const locals = await createBins(workspace, localPackages);
	const globals = await createBins(workspace, [...additionalPackages]);

	if (recursiveMode) {
		for (const pkg of projectList) {
			const current = await createBins(workspace, depNames(pkg.packageJson));
			await execute({
				deps: current,
				globalDeps: globals,
				monorepo: locals,
				packageRoot: pkg.absolute,
			});
		}
	} else {
		const pkg = await workspace.getNearestPackage(process.cwd());
		const current = await createBins(workspace, depNames(pkg.packageJson));
		await execute({
			deps: current,
			globalDeps: globals,
			monorepo: locals,
			packageRoot: pkg.absolute,
		});
	}
}

async function execute(ctx: IJobContext) {
	logger.log`linking binaries in project long<${ctx.packageRoot}>`;

	const final = new Map<string, string>();
	for (const list of [ctx.globalDeps, ctx.deps, ctx.monorepo]) {
		for (const bin of list) {
			final.set(bin.name, bin.absolutePath);
		}
	}

	const dry = argv.flag(['--dry']) > 0;
	const bindir = resolve(ctx.packageRoot, 'node_modules/.bin');
	for (const [name, target] of final) {
		const link = `${bindir}/${name}`;
		const rel = relativePath(bindir, target);
		if (dry) {
			logger.success(`Would link ${link} -> ${rel}`);
		} else {
			const ch = ensureLinkTargetSync(rel, link);
			if (ch) {
				logger.success`symlink: ${name} -> ${rel}`;
			} else {
				logger.debug`unchanged: ${name} -> ${rel}`;
			}
		}
	}
}

function depNames(pkgJson: DeepReadonly<IPackageJson>) {
	const o = Object.assign({}, pkgJson.dependencies, pkgJson.devDependencies, pkgJson.optionalDependencies);
	const r: string[] = [];
	for (const [name, version] of Object.entries(o)) {
		if (version.startsWith('workspace:')) {
		} else {
			r.push(name);
		}
	}
	return r;
}

async function createBins(workspace: MonorepoWorkspace, names: string[]) {
	const bins: BinaryDefine[] = [];
	const packageList = workspace.listPackages();

	for (const want of names) {
		for (const proj of await packageList) {
			if (proj.name === want) {
				makeBinMap(bins, proj.absolute, proj.packageJson);
			}
			const deps = depNames(proj.packageJson);
			if (deps.includes(want)) {
				const depRoot = resolve(proj.absolute, 'node_modules', want);
				const pkgJson: IPackageJson = JSON.parse(readFileSync(resolve(depRoot, 'package.json'), 'utf-8'));
				makeBinMap(bins, depRoot, pkgJson);
			}
		}
	}

	return bins;
}

function makeBinMap(result: BinaryDefine[], absolute: string, json: DeepReadonly<IPackageJson>) {
	if (!json.bin) return;

	let bins: Record<string, string> = {};
	if (typeof json.bin === 'string') {
		bins[basename(json.name)] = json.bin;
	} else {
		bins = json.bin;
	}

	for (const [name, path] of Object.entries(bins)) {
		const absolutePath = resolve(absolute, path);
		result.push({ name, absolutePath });
	}
}
