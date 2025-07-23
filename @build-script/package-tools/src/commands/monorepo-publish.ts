import {
	createWorkspace,
	normalizePackageName,
	type IPackageInfo,
	type MonorepoWorkspace,
} from '@build-script/monorepo-lib';
import { Emitter, prettyPrintError } from '@idlebox/common';
import { BuilderDependencyGraph, type IWatchEvents } from '@idlebox/dependency-graph';
import { logger } from '@idlebox/logger';
import { commandInPath, emptyDir, writeFileIfChangeSync } from '@idlebox/node';
import { cpSync, existsSync } from 'fs';
import { resolve } from 'path';
import { inspect } from 'util';
import { argv, CommandDefine, CSI, pArgS } from '../common/functions/cli.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { increaseVersion } from '../common/package-manager/package-json.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { cnpmSyncNames } from '../common/shared-jobs/cnpm-sync.js';
import { executeChangeDetect } from '../common/shared-jobs/detect-change-job.js';

export class Command extends CommandDefine {
	protected override _usage = `${pArgS('--debug')} ${pArgS('--dry')}`;
	protected override _description = '在monorepo中按照依赖顺序发布修改过的包';
	protected override _help = '';
	protected override _arguments = {
		'--debug': { flag: true, description: '详细输出模式' },
		'--dry': { flag: true, description: '仅检查修改，不发布（仍会修改version字段）' },
		'--private': { flag: false, description: '即使private=true也执行' },
	};
}

interface IState {
	readonly index: number;
	readonly length: number;
	readonly options: ReturnType<typeof options>;
}

let indexDisplay = 0;
class BuildPackageJob implements IWatchEvents {
	private readonly _onSuccess = new Emitter<void>();
	public readonly onSuccess = this._onSuccess.event;

	private readonly _onFailed = new Emitter<Error>();
	public readonly onFailed = this._onFailed.event;

	private readonly _onRunning = new Emitter<void>();
	public readonly onRunning = this._onRunning.event;

	private shouldPublish = '';

	constructor(
		private readonly state: IState,
		private readonly project: IPackageInfo,
		private readonly workspace: MonorepoWorkspace,
	) {
		this.onSuccess(() => {
			indexDisplay++;
			const { length } = this.state;
			const w = length.toFixed(0).length;
			console.log(`📦 [${indexDisplay.toFixed(0).padStart(w)}/${length}] ${this.project.name}`);
			console.log(this.logText.join('\n'));
			this.logText.length = 0;
		});
		this.onFailed((e) => {
			indexDisplay++;
			const { length } = this.state;
			const w = length.toFixed(0).length;
			console.log(`📦 [${indexDisplay.toFixed(0).padStart(w)}/${length}] ${this.project.name}`);
			console.log(this.logText.join('\n'));
			prettyPrintError('❌pack failed', e);
			this.logText.length = 0;
		});
	}

	get name() {
		return this.project.name;
	}

	getPackagePath() {
		return this.shouldPublish || undefined;
	}

	async execute() {
		this._onRunning.fire();
		this.log(`    🔍 ${CSI}38;5;14m检查包${CSI}0m`);

		const pm = await createPackageManager(PackageManagerUsageKind.Write, this.workspace, this.project.absolute);
		const { changedFiles, hasChange, remoteVersion } = await executeChangeDetect(pm, {});
		let shouldPublish = hasChange || changedFiles.length > 0;
		let localVersion = this.project.packageJson.version;

		if (hasChange) {
			const packageJson = await pm.loadPackageJson();
			localVersion = await increaseVersion(packageJson, remoteVersion || '0.0.0');
			this.log(`    ✍️ 已修改本地包版本: ${localVersion}`);
		}
		if (!shouldPublish) {
			this.log(`    ✨ ${CSI}38;5;10m未发现修改${CSI}0m\n`);
			this._onSuccess.fire();
			return;
		}

		this.log(`    🔄 打包文件`);

		const tempFile = resolve(
			this.workspace.temp,
			`publish/${normalizePackageName(this.project.name)}-${localVersion}.tgz`,
		);
		this.shouldPublish = await pm.pack(tempFile);

		if (remoteVersion) {
			this.log(`    🎈 即将发布新版本 "${this.project.packageJson.version}" 以更新远程版本 "${remoteVersion}"`);
		} else {
			this.log(`    🎈 即将发布初始版本 "${this.project.packageJson.version}"`);
		}
		this._onSuccess.fire();
	}

	private readonly logText: string[] = [];
	log(text: string) {
		this.logText.push(text);
	}

	[inspect.custom]() {
		// TODO
		return '~~~~~~~~';
	}
}

function options() {
	const dryRun = argv.flag('--dry') > 0;

	return {
		dryRun: dryRun,
	};
}

export async function main() {
	const workspace = await createWorkspace();
	await workspace.decoupleDependencies();

	const temp = resolve(workspace.temp, 'publish');
	await emptyDir(temp);

	const projects = await workspace.listPackages();

	const concurrency = argv.flag(['--debug', '-d']) > 0 ? 1 : 10;
	const graph = new BuilderDependencyGraph<BuildPackageJob>(concurrency, logger);
	const opts = options();

	const shouldPublishProjects = projects.filter((project) => {
		if (!project.packageJson.name) return false;

		if (project.packageJson.private) {
			console.log(`📦 ${project.name}`);
			console.log(`    🛑 跳过，private=true: ${project.name}`);
			graph.addEmptyNode(project.name);
			return false;
		}

		return true;
	});

	let index = 0;
	for (const project of shouldPublishProjects) {
		graph.addNode(
			project.name,
			project.devDependencies,
			new BuildPackageJob(
				{
					index,
					length: shouldPublishProjects.length,
					options: opts,
				},
				project,
				workspace,
			),
		);

		index++;
	}

	await graph.startup();

	const packageToPublish: { name: string; pack: string }[] = [];
	for (const id of graph.overallOrder) {
		const node = graph.getNodeData(id);
		if (!(node instanceof BuildPackageJob)) continue;

		const pack = node.getPackagePath();
		if (!pack) continue;
		packageToPublish.push({ name: node.name, pack });
	}
	console.log(`✅ 打包阶段结束，有 ${packageToPublish.length} 个包需要发布`);

	if (opts.dryRun) {
		console.log(`中断并退出（--dry）`);
		return;
	}

	const pm = await createPackageManager(PackageManagerUsageKind.Write, workspace, temp);
	const npmrc = workspace.getNpmRCPath(true);
	if (existsSync(npmrc)) {
		cpSync(npmrc, resolve(temp, '.npmrc'));
		writeFileIfChangeSync(resolve(temp, 'package.json'), '{}');
	}

	const w = packageToPublish.length.toFixed(0).length;
	let published: string[] = [];

	try {
		index = 1;
		for (const { name, pack } of packageToPublish) {
			console.log(`📦 [${index.toFixed(0).padStart(w)}/${packageToPublish.length}] ${name}`);
			const r = await pm.uploadTarball(pack);
			if (r.published) {
				console.log(`    👌 已发布新版本 ${r.version}`);
			} else {
				console.log(`    🤔 版本号未改变 ${r.version}`);
			}
			published.push(name);

			index++;
		}

		console.log(`🎉 所有任务完成，共发布了 ${published.length} 个包`);
	} catch (e) {
		logger.error`发布过程中发生错误: ${e instanceof Error ? e.message : e}`;
		throw e;
	} finally {
		if (await commandInPath('cnpm')) {
			await cnpmSyncNames(published, true).catch();
		}
	}
}
