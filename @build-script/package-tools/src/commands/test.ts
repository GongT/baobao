import { createSimpleProject } from '@build-script/monorepo-lib';
import { CommandDefine } from '../common/functions/cli.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';

export class Command extends CommandDefine {
	protected override _usage = '测试参数';
	protected override _description = '测试命令';
	protected override _help = '没有帮助信息';
	public override isHidden = true;
}

export async function main() {
	const w = await createSimpleProject();
	const pm = await createPackageManager(PackageManagerUsageKind.Read, w);
	const cache = await pm.createCacheHandler();

	const r = await cache.downloadTarball('react-dom', 'latest');
	console.log(r);
}
