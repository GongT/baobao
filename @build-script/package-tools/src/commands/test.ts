import { createSimpleProject } from '@build-script/monorepo-lib';
import { CommandDefine, logger } from '@idlebox/cli';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '测试参数';
	protected override readonly _description = '测试命令';
	protected override readonly _help = '没有帮助信息';
	protected override readonly _arguments = {
		'--test': {
			flag: false,
			usage: true,
			description: '关于test参数的说明',
		},
	};
	public readonly isHidden = true;
}

export async function main() {
	const w = await createSimpleProject();
	const pm = await createPackageManager(PackageManagerUsageKind.Read, w);
	const cache = await pm.createCacheHandler();

	logger.verbose('verbose日志');
	logger.debug('debug日志');
	logger.log('log日志');
	logger.warn('warn日志');
	logger.error('error日志');
	logger.success('success日志');

	const r = await cache.downloadTarball('react-dom', 'latest');
	console.log(r);
}
