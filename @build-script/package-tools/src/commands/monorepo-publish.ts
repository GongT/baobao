import { applyPublishWorkspace, createWorkspace, normalizePackageName, type IPackageInfo, type MonorepoWorkspace } from '@build-script/monorepo-lib';
import { app, argv, CommandDefine, CSI, logger } from '@idlebox/cli';
import { prettyPrintError } from '@idlebox/common';
import { Job, JobGraphBuilder, JobState } from '@idlebox/dependency-graph';
import { commandInPath, emptyDir, setExitCodeIfNot, shutdown, workingDirectory, writeFileIfChange } from '@idlebox/node';
import { FsNodeType, spawnReadonlyFileSystemWithCommand } from '@idlebox/unshare';
import { execaNode } from 'execa';
import { existsSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { pArgS } from '../common/functions/cli.js';
import { PackageManagerUsageKind, type PackageManager } from '../common/package-manager/driver.abstract.js';
import { PNPM } from '../common/package-manager/driver.pnpm.js';
import { increaseVersion } from '../common/package-manager/package-json.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { clearNpmMetaCache } from '../common/shared-jobs/clear-cache.js';
import { cnpmSyncNames } from '../common/shared-jobs/cnpm-sync.js';
import { executeChangeDetect } from '../common/shared-jobs/detect-change-job.js';

export class Command extends CommandDefine {
	protected override readonly _usage = `${pArgS('--debug')} ${pArgS('--dry')}`;
	protected override readonly _description = '在monorepo中按照依赖顺序发布修改过的包';
	protected override readonly _help = '';
	protected override readonly _arguments = {
		'--debug': { flag: true, description: '详细输出模式' },
		'--dry': { flag: true, description: '仅检查修改，不发布（仍会修改version字段）' },
		'--private': { flag: true, description: '即使private=true也执行' },
		'--concurrency': { flag: false, description: '并发数（默认5）' },
		// '--no-unshare': { flag: true, description: '不执行unshare逻辑（在linux上默认执行）' },
	};
}

class BuildPackageJob extends Job<void> {
	private shouldPublish = '';

	constructor(
		name: string,
		deps: readonly string[],
		private readonly project: IPackageInfo,
		private readonly workspace: MonorepoWorkspace,
		unshareExecuter: boolean,
	) {
		super(name, deps);

		this.detect = unshareExecuter ? this.unsharedDetect : this.sharedDetect;
		this.pack = unshareExecuter ? this.unsharedPack : this.sharedPack;
	}

	private readonly logText: string[] = [];
	log(text: string) {
		this.logText.push(text);
	}
	flushLog() {
		console.log(this.logText.join('\n'));
		this.logText.length = 0;
	}

	getPackagePath() {
		return this.shouldPublish || undefined;
	}

	private readonly detect: typeof executeChangeDetect;

	private async unsharedDetect() {
		const exArgs = [];
		if (app.verbose) {
			exArgs.push('-dd');
		} else {
			exArgs.push('-d');
		}
		const promise = execaNode(process.argv[1], ['detect-package-change', '--unshare', this.workspace.root, ...exArgs], {
			stdio: ['ignore', 'pipe', 'pipe'],
			cwd: this.project.absolute,
			encoding: 'utf8',
			env: {
				LOGGER_PREFIX: `package-change:${normalizePackageName(this.project.name, ':')}`,
				// FORCE_COLOR: logger.colorEnabled ? '1' : '',
			},
			all: true,
		});

		let result: Awaited<typeof promise>;
		try {
			result = await promise;
		} catch (e: unknown) {
			this.log(`${CSI}K${CSI}0;3;2m${(e as any).all}${CSI}0m`);
			throw new Error(`子项目 ${this.project.name} 中运行修改检测失败（日志在上方）`);
		}

		try {
			const { changedFiles, changed: hasChange, remoteVersion } = JSON.parse(result.stdout);
			return { changedFiles, hasChange, remoteVersion };
		} catch (e: any) {
			this.log(result.stdout);
			throw new Error(`子程序输出不是json: ${e.message}`);
		}
	}

	private async sharedDetect(pm: PackageManager) {
		return await executeChangeDetect(pm, {});
	}

	private readonly pack: typeof this.sharedPack;

	private async unsharedPack(_pm: PackageManager, tempFile: string) {
		const exArgs = [];
		if (app.verbose) {
			exArgs.push('-dd');
		} else {
			exArgs.push('-d');
		}

		const promise = spawnReadonlyFileSystemWithCommand(
			{
				options: {
					volumes: [
						{ path: this.workspace.root, type: FsNodeType.readonly },
						{ path: this.project.absolute, type: FsNodeType.passthru },
						{ path: dirname(tempFile), type: FsNodeType.passthru },
					],
					verbose: true,
				},
				command: {
					scriptFile: process.argv[1],
					argv: ['unshare-make-tarball', '--output', tempFile, ...exArgs, '--project', this.project.name],
				},
			},
			{
				stdin: 'ignore',
				stdout: 'pipe',
				stderr: 'pipe',
				cwd: this.project.absolute,
				encoding: 'utf8',
				all: true,
				env: {
					LOGGER_PREFIX: `unshare-pack:${normalizePackageName(this.project.name, ':')}`,
				},
			},
		);

		let result: Awaited<typeof promise>;
		try {
			result = await promise;
		} catch (e: unknown) {
			this.log(`${CSI}K${CSI}0;3;2m${(e as any).all}${CSI}0m`);
			throw new Error(`子项目 ${this.project.name} 中运行修改检测失败（日志在上方）`);
		}

		const filePath = result.stdout.trim();
		if (!existsSync(filePath)) {
			this.log(`${CSI}K${CSI}0;3;2m${result.all}${CSI}0m`);
			throw new Error(`应该打包的文件不存在: ${filePath}`);
		}

		return filePath;
	}

	private async sharedPack(pm: PackageManager, tempFile: string) {
		return await pm.pack(tempFile);
	}

	protected override async _execute() {
		this.setState(JobState.Running);
		try {
			this.log(`    🔍 ${CSI}38;5;14m检查包${CSI}0m`);

			const pm = await createPackageManager(PackageManagerUsageKind.Write, this.workspace, this.project.absolute);
			const { changedFiles, hasChange, remoteVersion, packageJsonDiff } = await this.detect(pm);
			const shouldPublish = hasChange || changedFiles.length > 0;
			let localVersion = this.project.packageJson.version;

			if (process.env.CI && changedFiles.length) {
				this.log(`::group::    👀 ${changedFiles.length} 个文件有修改`);
				for (const file of changedFiles) {
					this.log(`  * ${file}`);
					if (file === 'package.json') {
						this.log(`${packageJsonDiff}`);
					}
				}
				this.log(`::endgroup::`);
			} else {
				this.log(`    👀 ${changedFiles.length} 个文件有修改: ${changedFiles.slice(0, 3).join(', ')}${changedFiles.length > 3 ? ' ...' : ''}`);
			}
			if (hasChange) {
				this.project.absolute;
				const packageJson = await pm.loadPackageJson();
				localVersion = await increaseVersion(packageJson, remoteVersion || '0.0.0');
				this.log(`    ✍️  已修改本地包版本: ${localVersion}`);
			}
			if (!shouldPublish) {
				this.log(`    ✨ ${CSI}38;5;10m未发现修改${CSI}0m\n`);
				this.setState(JobState.SuccessExited);
				return;
			}

			this.log(`    🔄 打包文件`);
			const tempFile = resolve(this.workspace.temp, `publish/${normalizePackageName(this.project.name)}-${localVersion}.tgz`);
			this.shouldPublish = await this.pack(pm, tempFile);
			this.log(`       📦 ${relative(this.workspace.root, this.shouldPublish)}`);

			if (remoteVersion) {
				this.log(`    🎈 即将发布新版本 "${localVersion}" 以更新远程版本 "${remoteVersion}"\n`);
			} else {
				this.log(`    🎈 即将发布初始版本 "${localVersion}"\n`);
			}

			this.setState(JobState.SuccessExited);
		} catch (e: any) {
			this.setState(JobState.ErrorExited, e);
		}
	}
}

function options() {
	const dryRun = argv.flag(['--dry']) > 0;

	return {
		dryRun: dryRun,
	};
}

async function prepareTempFolder(temp: string, pm: PackageManager) {
	await emptyDir(temp);

	const npmrc = pm.workspace.getNpmRCPath(true);
	if (existsSync(npmrc)) {
		await copyFile(npmrc, resolve(temp, '.npmrc'));
	} else {
		logger.debug`npmrc文件不存在 (long<${npmrc}>)`;
	}

	if (pm instanceof PNPM) {
		const workspaceFile = resolve(pm.workspace.root, 'pnpm-workspace.yaml');
		await applyPublishWorkspace({
			sourceFile: workspaceFile,
			targetDir: temp,
			isPublish: true,
		});
	}

	await writeFileIfChange(resolve(temp, 'package.json'), '{}');
}

export async function main() {
	const workspace = await createWorkspace();
	workingDirectory.chdir(workspace.root);
	const zipDir = resolve(workspace.temp, 'publish');

	await workspace.decoupleDependencies();
	const pm = await createPackageManager(PackageManagerUsageKind.Write, workspace, zipDir);
	await prepareTempFolder(zipDir, pm);

	const projects = await workspace.listPackages();

	let concurrency = Number.parseInt(argv.single(['--concurrency']) || '0') || 5;
	if (app.debug) {
		concurrency = 1;
		logger.warn`由于设置了--debug参数，运行模式改为单线程`;
	}
	const builder = new JobGraphBuilder(concurrency, logger);

	const opts = options();

	const shouldPublishProjects = projects.filter((project) => {
		if (!project.packageJson.name) return false;

		if (project.packageJson.private) {
			console.log(`📦 ${project.name}`);
			console.log(`    🛑 跳过，private=true: ${project.name}`);
			builder.addEmptyNode(project.name);
			return false;
		}

		return true;
	});

	let index = 0;
	let indexDisplay = 0;
	const width = shouldPublishProjects.length.toFixed(0).length;
	for (const project of shouldPublishProjects) {
		const job = new BuildPackageJob(project.name, project.devDependencies, project, workspace, false);

		job.onStateChange(() => {
			if (job.isStopped()) {
				indexDisplay++;
				console.log(`${CSI}K📦 [${indexDisplay.toFixed(0).padStart(width)}/${shouldPublishProjects.length}] ${project.name}`);
				job.flushLog();

				const e = job.getLastError();
				if (e) {
					prettyPrintError(`job failed for ${project.name}`, e);
				}
			}

			debugSummary();
		});
		builder.addNode(job);

		index++;
	}

	const graph = builder.finalize();

	function debugSummary() {
		const info = graph?.debugFormatSummary();
		process.stderr.write(`${CSI}K${info}\r`);
	}
	await graph.startup();

	const packageToPublish: { name: string; pack: string }[] = [];
	for (const id of graph.overallOrder) {
		const node = graph.getNodeByName(id);
		if (!(node instanceof BuildPackageJob)) continue;

		const pack = node.getPackagePath();
		if (!pack) continue;
		packageToPublish.push({ name: node.name, pack });
	}
	console.log(`✅ 打包阶段结束，有 ${packageToPublish.length} 个包需要发布`);

	if (opts.dryRun) {
		console.log(`中断并退出（--dry）`);
		throw shutdown(0);
	}

	const w = packageToPublish.length.toFixed(0).length;
	const published: string[] = [];

	try {
		index = 1;
		for (const { name, pack } of packageToPublish) {
			console.log(`📦 [${index.toFixed(0).padStart(w)}/${packageToPublish.length}] ${name}`);
			const r = await pm.uploadTarball(pack, zipDir);
			if (r.published) {
				console.log(`    👌 已发布新版本 ${r.version}`);
			} else {
				console.log(`    🤔 版本号未改变 ${r.version}`);
			}
			published.push(name);

			index++;
		}

		console.log(`🎉 所有任务完成，共发布了 ${published.length} 个包`);
	} catch (e: any) {
		prettyPrintError(`发布过程中发生错误`, e);
		setExitCodeIfNot(1);
	} finally {
		if (published.length > 0 && (await commandInPath('cnpm'))) {
			await cnpmSyncNames(published, true);

			const pm = await createPackageManager(PackageManagerUsageKind.Read, workspace);
			await clearNpmMetaCache(pm, published);
		}
	}
	shutdown(0);
}
