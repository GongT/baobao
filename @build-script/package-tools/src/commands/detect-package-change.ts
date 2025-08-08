import { createWorkspaceOrPackage } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { printLine } from '@idlebox/node';
import { isJsonOutput } from '../common/functions/cli.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { increaseVersion } from '../common/package-manager/package-json.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';
import { executeChangeDetect } from '../common/shared-jobs/detect-change-job.js';

process.env.COREPACK_ENABLE_STRICT = '0';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '本地运行npm pack并与npm上的最新版本对比差异';
	protected override readonly _help = '';
	protected override readonly _arguments = {
		'--bump': { flag: true, description: '当发现更改时更新package.json，增加版本号0.0.1' },
	};
}

export async function main() {
	const autoInc = argv.flag('--bump');

	const workspace = await createWorkspaceOrPackage();
	const pm = await createPackageManager(PackageManagerUsageKind.Read, workspace);

	const pkgJson = await pm.loadPackageJson();
	const { changedFiles, hasChange, remoteVersion } = await executeChangeDetect(pm, {});

	if (autoInc) {
		if (changedFiles.length) {
			logger.log('自动增加版本号...');
			if (!remoteVersion) {
				throw new Error('程序错误, remoteVersion 为空');
			}
			await increaseVersion(pkgJson, remoteVersion);
		} else {
			logger.log('没有检测到更改');
		}
	} else {
		printResult(changedFiles, hasChange);
	}
	return 0;
}

function printResult(changedFiles: string[], changed: boolean) {
	if (process.stdout.isTTY && !isJsonOutput) {
		if (changedFiles.length === 0) {
			console.log('changes: no');
		} else {
			printLine();
			logger.log('%s', changedFiles.join('\n'));
			printLine();
			console.log('changes: yes');
		}
	} else {
		console.log(JSON.stringify({ changedFiles, changed }));
	}
}
