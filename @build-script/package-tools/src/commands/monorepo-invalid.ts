import { createWorkspace } from '@build-script/monorepo-lib';
import { CommandDefine } from '@idlebox/cli';
import { logger } from '@idlebox/cli';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '从npm缓存中删除关于本monorepo的数据，以便安装最新版本';
	protected override readonly _help = '';
}

export async function main() {
	const workspace = await createWorkspace();
	const packageManager = await createPackageManager(PackageManagerUsageKind.Read, workspace);
	const cache = await packageManager.createCacheHandler();

	const list = await workspace.listPackages();

	logger.log('删除%d个项目在 %s 的npm缓存', list.length, cache.path);
	for (const data of list) {
		await cache.deleteMetadata(data.packageJson.name);
	}
}
