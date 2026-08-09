import { createWorkspaceOrPackage } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { shutdown } from '@idlebox/node';
import { pDesc } from '../common/functions/cli.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { clearNpmMetaCache } from '../common/shared-jobs/clear-cache.js';
import { cnpmSync, CNpmSyncError } from '../common/shared-jobs/cnpm-sync.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '请求cnpm仓库拉取monorepo中的最新版本';
	protected override readonly _help = pDesc('需要在PATH中存在cnpm命令');
	protected override _arguments = {
		'--all': { flag: true, usage: true, description: '同步所有包，默认同步当前工作目录的包' },
	};
}

export async function main() {
	const dry = argv.flag(['--dry']) > 0;
	const all = argv.flag(['--all']) > 0;

	const workspace = await createWorkspaceOrPackage();
	const pm = await createPackageManager(PackageManagerUsageKind.Read, workspace);
	const nameVersion: Record<string, string> = {};

	if (all) {
		if (!workspace.isMonorepo) {
			logger.warn`未发现monorepo工作区，--all参数无效`;
		}

		const list = await workspace.listPackages();

		logger.info`工作区中共有${list.length}个包`;
		for (const pkg of list) {
			if (!pkg.packageJson.name || !pkg.packageJson.version || pkg.packageJson.private) {
				logger.log`包 ${pkg.relative} 私有或没有name&version，跳过`;
				continue;
			}
			logger.log`包${pkg.packageJson.name}@${pkg.packageJson.version}将被同步`;
			nameVersion[pkg.packageJson.name] = pkg.packageJson.version;
		}
	} else {
		const pkgJson = await pm.loadPackageJson();
		if (pkgJson.private) {
			logger.error`当前包是私有的`;
			throw shutdown(1);
		}
		if (!pkgJson.name || !pkgJson.version) {
			logger.error`当前包没有name或version`;
			throw shutdown(1);
		}

		nameVersion[pkgJson.name] = pkgJson.version;
	}

	logger.info`将同步${Object.keys(nameVersion).length}个包到cnpm仓库`;

	if (dry) {
		logger.warn`dry模式，实际不会执行同步`;
		return;
	}

	const ps: Promise<any>[] = [];
	for (const [name, version] of Object.entries(nameVersion)) {
		const handle = await cnpmSync(name, {
			version: version,
			tip: '用户使用CLI命令',
		});
		logger.verbose` - ${name}@${version} 开始同步 id=${handle.syncId}`;

		const p = handle.wait().then(
			(result) => {
				logger.success` - ${name}@${version} 同步完成 id=${handle.syncId} | ${handle.logUrl}`;
				if (logger.verbose.isEnabled) {
					result.log.split('\n').forEach((line) => {
						logger.verbose(`    ${line}`);
					});
				}
			},
			async (e) => {
				logger.error` - ${name}@${version} 同步失败 id=${handle.syncId} | ${handle.logUrl}`;
				if (e instanceof CNpmSyncError) {
					const log = await e.log();
					log.split('\n').forEach((line) => {
						logger.log(`    ${line}`);
					});
				} else {
					logger.log`未知错误类型: ${e}`;
				}
			},
		);

		ps.push(p);
	}

	logger.info`清理本地npm缓存...`;
	await clearNpmMetaCache(pm, Object.keys(nameVersion));

	logger.info`等待所有同步完成`;
	await Promise.all(ps);
}
