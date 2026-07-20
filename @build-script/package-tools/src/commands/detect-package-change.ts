import { createWorkspaceOrPackage } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { isLinux, isPathContains, UsageError } from '@idlebox/common';
import { printLine } from '@idlebox/node';
import { FsNodeType, unshareReadonlyFileSystem } from '@idlebox/unshare';
import { resolve } from 'node:path';
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
		'--unshare': { flag: false, description: '[linux] 在虚拟环境中运行（不支持bump），传入参数为overlay根目录' },
	};
}

export async function main() {
	process.env.COREPACK_ENABLE_STRICT = '0';
	const unshareFrom = argv.single(['--unshare']);
	const quiet = argv.flag(['--quiet', '-q']) > 0;
	const autoInc = argv.flag(['--bump']) > 0;
	const jsonOutput = argv.flag(['--json']) > 0 || !process.stdout.isTTY;

	if (autoInc) {
		if (jsonOutput) throw new UsageError(`--json和--bump不能同时使用`);
		if (unshareFrom) throw new UsageError(`--unshare和--bump不能同时使用`);
	}

	const workspace = await createWorkspaceOrPackage();
	const pm = await createPackageManager(PackageManagerUsageKind.Read, workspace);

	if (unshareFrom && !process.env.DETECT_PKG_CHANGE_HAS_BEEN_UNSHARED) {
		if (!isLinux) {
			throw new UsageError(`--unshare 仅在Linux环境下支持`);
		}

		const root = resolve(process.cwd(), unshareFrom);
		if (!isPathContains(root, process.cwd(), true)) {
			throw new UsageError(`--unshare 指定的目录必须是当前目录的父级或自身`);
		}

		logger.debug`unshare overlay long<${root}>`;

		process.env.DETECT_PKG_CHANGE_HAS_BEEN_UNSHARED = '1';
		process.env.NODE_OPTIONS = '1';

		const cache = await pm.createCacheHandler();

		unshareReadonlyFileSystem('10e25435-eae0-4c24-a3fd-ce5dee64b442', {
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
	const { changedFiles, hasChange, remoteVersion, packageJsonDiff } = await executeChangeDetect(pm, {});

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
				printLine();
				logger.log`list<${changedFiles}>`;
				printLine();
				if (!quiet) console.log('有更改');
				process.exitCode = 0;
			}
		}
	}
}
