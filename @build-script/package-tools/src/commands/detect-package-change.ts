import { createWorkspaceOrPackage } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { isLinux, isPathContains, UsageError } from '@idlebox/common';
import { printLine } from '@idlebox/node';
import { FsNodeType, unshareReadonlyFileSystem } from '@idlebox/unshare';
import { resolve } from 'node:path';
import type { FileDiffOp } from '../common/git/diff.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { increaseVersion } from '../common/package-manager/package-json.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { executeChangeDetect } from '../common/shared-jobs/detect-change-job.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '本地运行npm pack并与npm上的最新版本对比差异';
	protected override readonly _help = '';
	protected override readonly _arguments = {
		'--bump': { usage: true, flag: true, description: '当发现更改时更新package.json，增加版本号0.0.1' },
		'--json': { usage: true, flag: true, description: '输出JSON格式（不支持bump）' },
		'--diff': { usage: true, flag: true, description: '输出文件差异对比' },
		'--unshare': { flag: false, description: '[linux] 在虚拟环境中运行（不支持bump），传入一个目录，此目录自动overlay' },
	};
}

export async function main() {
	process.env.pnpm_config_verify_deps_before_run = '';
	process.env.COREPACK_ENABLE_STRICT = '0';

	const unshareEnvKey = '10e25435-eae0-4c24-a3fd-ce5dee64b442';
	let unshareFrom = argv.single(['--unshare']);
	const quiet = argv.flag(['--quiet', '-q']) > 0;
	const autoInc = argv.flag(['--bump']) > 0;
	const showDiff = argv.flag(['--diff']) > 0;
	const jsonOutput = argv.flag(['--json']) > 0 || !process.stdout.isTTY;

	if (autoInc) {
		if (jsonOutput) throw new UsageError(`--json和--bump不能同时使用`);
		if (unshareFrom) throw new UsageError(`--unshare和--bump不能同时使用`);
		if (showDiff) throw new UsageError(`--diff和--bump不能同时使用`);
	}

	const workspace = await createWorkspaceOrPackage();
	const pm = await createPackageManager(PackageManagerUsageKind.Read, workspace);

	if (unshareFrom) {
		if (process.env[unshareEnvKey]) {
			unshareFrom = '';
			logger.debug`命名空间创建成功，已在虚拟环境中运行`;
		} else if (process.env.NEVER_UNSHARE) {
			logger.info`由于设置了NEVER_UNSHARE环境变量，--unshare选项被忽略`;
			unshareFrom = '';
		}
	}
	if (unshareFrom) {
		if (!isLinux) {
			throw new UsageError(`--unshare 仅在Linux环境下支持`);
		}

		const root = resolve(process.cwd(), unshareFrom);
		if (!isPathContains(root, process.cwd(), true)) {
			throw new UsageError(`--unshare 指定的目录必须是当前目录的父级或自身`);
		}

		logger.debug`unshare overlay long<${root}>`;

		// process.env.NODE_OPTIONS = '--enable-source-maps';

		const cache = await pm.createCacheHandler();

		unshareReadonlyFileSystem(unshareEnvKey, {
			volumes: [
				{ path: root, type: FsNodeType.volatile },
				{ path: cache.path, type: FsNodeType.passthru },
			],
			verbose: logger.verbose.isEnabled,
			// pid: true,
		});

		throw new Error('unshare请求无法实现');
	}

	const pkgJson = await pm.loadPackageJson();
	const { changedFiles, hasChange, remoteVersion, packageJsonDiff, gitrepo } = await executeChangeDetect(pm, {});

	const diffFiles: Record<string, FileDiffOp> = {};
	if (showDiff && gitrepo) {
		for (const diff of await gitrepo.allDiff()) {
			const current = diff.parseHeader().git?.command?.path;
			if (current) {
				diffFiles[current] = diff;
			} else {
				logger.warn`无法解析 diff 的文件路径: long<${diff.raw}>`;
			}
		}
		logger.debug`计算了所有文件的 diff 信息，共 ${Object.keys(diffFiles).length} 个文件`;
	}

	if (autoInc) {
		if (changedFiles.length) {
			logger.log('自动增加版本号...');
			if (!remoteVersion) {
				throw new Error('程序错误, remoteVersion 为空');
			}
			await increaseVersion(pkgJson, remoteVersion, packageJsonDiff.incompatible ? 'minor' : 'patch');
		} else {
			logger.log('没有检测到更改');
		}
	} else {
		if (jsonOutput) {
			const fmt = process.stdout.isTTY ? 2 : undefined;
			console.log(
				JSON.stringify(
					{
						remoteVersion,
						changedFiles,
						changed: hasChange,
						packageJsonDiff,
						diffFiles,
					},
					null,
					fmt,
				),
			);
		} else {
			if (changedFiles.length === 0) {
				if (!quiet) console.log('没有更改');
				process.exitCode = 1;
			} else {
				if (diffFiles) {
					for (const [file, diff] of Object.entries(diffFiles)) {
						logger.info`文件差异: long<${file}>`;
						const str = diff.sideBySide({ heading: ['发布版本', '当前版本'], lineLimit: 5, context: false });
						if (logger.colorEnabled) {
							console.error(`\x1b[2m${str}\x1b[0m`);
						} else {
							console.error(str);
						}
					}
				} else {
					printLine();
					logger.log`list<${changedFiles}>`;
					printLine();
				}
				if (!quiet) console.log('有更改');
				process.exitCode = 0;
			}
		}
	}
}
