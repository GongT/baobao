import { createWorkspace } from '@build-script/monorepo-lib';
import { CommandDefine, logger } from '@idlebox/cli';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { NPM } from '../common/package-manager/driver.npm.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '从npm缓存中删除关于本monorepo的数据，以便安装最新版本';
	protected override readonly _help = '';
}

export async function main() {
	const workspace = await createWorkspace();
	const packageManager = new NPM(PackageManagerUsageKind.Read, workspace);
	const cache = await packageManager.createCacheHandler();

	const list = await workspace.listPackages();

	logger.log('删除%d个项目在 %s 的npm缓存', list.length, cache.path);
	for (const data of list) {
		await cache.deleteMetadata(data.packageJson.name);
	}
}
