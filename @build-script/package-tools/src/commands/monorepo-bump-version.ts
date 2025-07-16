import { createWorkspace, type IPackageInfo, type MonorepoWorkspace } from '@build-script/monorepo-lib';
import { Emitter, humanDate } from '@idlebox/common';
import { BuilderDependencyGraph, type IWatchEvents } from '@idlebox/dependency-graph';
import { logger } from '@idlebox/logger';
import { makeRe } from 'minimatch';
import { inspect } from 'node:util';
import { argv, CommandDefine, CSI } from '../common/functions/cli.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { increaseVersion } from '../common/package-manager/package-json.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { executeChangeDetect } from '../common/shared-jobs/detect-change-job.js';

export class Command extends CommandDefine {
	protected override _usage = ``;
	protected override _description = '在monorepo中按照依赖顺序分别运行detect-package-change';
	protected override _help = '';
	protected override _arguments = {
		'--skip': { flag: false, description: '跳过前N-1个包（从第N个包开始运行）' },
		'--allow-private': { flag: true, description: '即使private=true也执行' },
		'--exclude': { flag: false, description: '排除指定的包' },
	};
}

interface IState {
	readonly index: number;
	readonly length: number;
	readonly options: ReturnType<typeof options>;
	readonly changedPackages: string[];
}

class BumpVersionJob implements IWatchEvents {
	private readonly _onSuccess = new Emitter<void>();
	public readonly onSuccess = this._onSuccess.event;

	private readonly _onFailed = new Emitter<Error>();
	public readonly onFailed = this._onFailed.event;

	private readonly _onRunning = new Emitter<void>();
	public readonly onRunning = this._onRunning.event;

	private readonly allowPrivate: boolean;

	constructor(
		private readonly state: IState,
		private readonly project: IPackageInfo,
		private readonly workspace: MonorepoWorkspace,
	) {
		this.allowPrivate = argv.flag('--allow-private') > 0;
	}

	async execute() {
		const { index, length, options, changedPackages } = this.state;
		const w = length.toFixed(0).length;
		console.log(`📦 [${(index + 1).toFixed(0).padStart(w)}/${length}] ${this.project.name}`);
		if (this.project.packageJson.private && !this.allowPrivate) {
			console.log(`  🛑 跳过，private=true: ${this.project.name}`);
		} else if (options.skip > index + 1 || options.exclude?.test(this.project.name)) {
			console.log(`  ⏩ ${CSI}2m跳过${CSI}0m`);
		} else {
			const startTime = Date.now();

			console.log(`  🔍 ${CSI}38;5;14m检查包${CSI}0m`);

			const pm = await createPackageManager(PackageManagerUsageKind.Write, this.workspace, this.project.absolute);
			const { hasChange, remoteVersion } = await executeChangeDetect(pm, { forcePrivate: this.allowPrivate });

			if (!remoteVersion) {
				console.log('    ✨ 远程版本不存在\n');
				if (this.project.packageJson.version !== '0.0.1') {
					throw new Error(`远程版本不存在，但本地包版本不是 0.0.1\n  package: ${pm.projectPath}/package.json`);
				}
			} else if (hasChange) {
				changedPackages.push(this.project.name);

				const packageJson = await pm.loadPackageJson();
				await increaseVersion(packageJson, remoteVersion);
				console.log('    ✍️ 已修改本地包版本\n');
			} else {
				console.log(`    ✨ ${CSI}38;5;10m未发现修改${CSI}0m (in ${humanDate.delta(Date.now() - startTime)})\n`);
			}
		}
	}

	[inspect.custom]() {
		// TODO
		return '~~~~~~~~';
	}
}

function options() {
	const excludes = argv.multiple('--exclude');
	let excludeReg: RegExp | undefined;
	if (excludes.length > 0) {
		let regTxt = [];
		for (const exclude of excludes) {
			const match = makeRe(exclude, { platform: 'linux' });
			if (!match) {
				throw new Error(`无法解析排除模式: ${exclude}`);
			}
			regTxt.push(match.source);
		}
		excludeReg = new RegExp(`^(${regTxt.join('|')})$`);
	}

	const skip = Number.parseInt(argv.single('--skip') || '0');
	if (Number.isNaN(skip)) {
		throw new Error('skip 不是数字');
	}

	return {
		exclude: excludeReg,
		skip: skip,
	};
}

export async function main() {
	const workspace = await createWorkspace();
	await workspace.decoupleDependencies();
	const projects = await workspace.listPackages();

	const graph = new BuilderDependencyGraph(1, logger);

	const opts = options();

	const changedPackages: string[] = [];

	let index = 0;
	for (const project of projects) {
		if (!project.packageJson.name) continue;

		graph.addNode(
			project.packageJson.name,
			[],
			new BumpVersionJob(
				{
					index,
					length: projects.length,
					options: opts,
					changedPackages,
				},
				project,
				workspace,
			),
		);

		index++;
	}

	await graph.startup();

	console.log(`🎉 所有任务完成，共修改了 ${changedPackages.length} 个包`);
}
