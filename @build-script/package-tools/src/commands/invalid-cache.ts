import { createWorkspaceOrPackage } from '@build-script/monorepo-lib';
import { CommandDefine, logger } from '@idlebox/cli';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { NPM } from '../common/package-manager/driver.npm.js';
import { PNPM } from '../common/package-manager/driver.pnpm.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '从npm缓存中删除关于本monorepo的数据，以便安装最新版本';
	protected override readonly _help = '';
}

export async function main() {
	const workspace = await createWorkspaceOrPackage();
	const cache1 = await new NPM(PackageManagerUsageKind.Read, workspace).createCacheHandler();
	const cache2 = await new PNPM(PackageManagerUsageKind.Read, workspace).createCacheHandler();

	const list = await workspace.listPackages();

	const names = list.map((data) => data.packageJson.name);
	logger.log('删除%d个项目在 %s 的npm缓存', list.length, cache1.path);
	await cache1.deleteAllMetadata(names);
	logger.log('删除%d个项目在 %s 的pnpm缓存', list.length, cache2.path);
	await cache2.deleteAllMetadata(names);
}
