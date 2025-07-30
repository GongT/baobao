import { createWorkspace } from '@build-script/monorepo-lib';
import { argv } from '@idlebox/args/default';
import { CommandDefine, isQuiet, pDesc } from '../common/functions/cli.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { clearNpmMetaCache } from '../common/shared-jobs/clear-cache.js';
import { cnpmSyncNames } from '../common/shared-jobs/cnpm-sync.js';

export class Command extends CommandDefine {
	protected override _usage = '';
	protected override _description = '调用cnpm sync命令';
	protected override _help = pDesc('需要在PATH中存在cnpm命令');
}

export async function main() {
	const workspace = await createWorkspace();
	const list = await workspace.listPackages();

	const dry = argv.flag('--dry') > 0;

	const names = list
		.filter((e) => {
			return !!e.packageJson.name && !e.packageJson.private;
		})
		.map((e) => e.packageJson.name);

	await cnpmSyncNames(names, isQuiet, dry);

	const pm = await createPackageManager(PackageManagerUsageKind.Read, workspace);
	await clearNpmMetaCache(pm, names);
}
