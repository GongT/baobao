import { createWorkspace, type MonorepoWorkspace } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import type { DeepReadonly, IPackageJson } from '@idlebox/common';
import { ensureLinkTargetSync } from '@idlebox/ensure-symlink';
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
			description: '将外部依赖视为直接依赖 (必须是至少一个项目的依赖，否则找不到)',
		},
		'--transparent': {
			flag: false,
			description: '将workspace中其他项目的依赖视为此项目的',
		},
		'--recursive': {
			usage: true,
			flag: true,
			description: '在workspace的每个项目中分别运行此命令',
		},
	};
}

interface BinaryDefine {
	readonly name: string;
	readonly absolutePath: string;
}
interface IJobContext {
	/**
	 * 连接到哪里（接收者）
	 */
	readonly packageRoot: string;
	/**
	 * 当前项目依赖
	 */
	readonly direct: readonly BinaryDefine[];
	/**
	 * 命令行要求的外部依赖
	 */
	readonly manual: readonly BinaryDefine[];
	/**
	 * workspace中其他项目依赖
	 */
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

	const locals = await collectBinaryByName(workspace, localPackages);
	const globals = await collectBinaryByName(workspace, [...additionalPackages]);

	if (recursiveMode) {
		for (const pkg of projectList) {
			const current = await collectBinaryByName(workspace, depNames(pkg.packageJson));
			await execute({
				direct: current,
				manual: globals,
				monorepo: locals,
				packageRoot: pkg.absolute,
			});
		}
	} else {
		const pkg = await workspace.getNearestPackage(process.cwd());
		const current = await collectBinaryByName(workspace, depNames(pkg.packageJson));
		await execute({
			direct: current,
			manual: globals,
			monorepo: locals,
			packageRoot: pkg.absolute,
		});
	}
}

async function execute(ctx: IJobContext) {
	const final = new Map<string, string>();
	for (const list of [ctx.manual, ctx.monorepo, ctx.direct]) {
		for (const bin of list) {
			final.set(bin.name, bin.absolutePath);
		}
	}

	logger.log`linking ${final.size} binaries in project long<${ctx.packageRoot}>`;
	logger.verbose`mappinglist<${final}>`;

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

/**
 * 收集指定名称的二进制文件
 */
async function collectBinaryByName(workspace: MonorepoWorkspace, names: string[]) {
	if(names.length === 0) return [];

	const bins: BinaryDefine[] = [];
	const packageList = await workspace.listPackages();

	for (const proj of packageList) {
		for (const want of names) {
			if (proj.name === want) {
				binariesInPackage(bins, proj.absolute, proj.packageJson);
			}
			const deps = depNames(proj.packageJson);
			if (deps.includes(want)) {
				const depRoot = resolve(proj.absolute, 'node_modules', want);
				let pkgJson: IPackageJson;
				try{
					pkgJson = JSON.parse(readFileSync(resolve(depRoot, 'package.json'), 'utf-8'));
				} catch (e) {
					logger.warn`dependency ${want} is invalid (in ${proj.name}), skipping: ${e}`;
					continue;
				}
				binariesInPackage(bins, depRoot, pkgJson);
			}
		}
	}

	return bins;
}

function binariesInPackage(result: BinaryDefine[], absolute: string, json: DeepReadonly<IPackageJson>) {
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
