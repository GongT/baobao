import { resolve } from 'path';
import { executeChangeDetect } from '../inc/shared-jobs/detect-change-job.js';
import { readPackageJson } from '../inc/fs.js';
import { argv, formatOptions, isJsonOutput, pArgS, pDesc } from '../inc/getArg.js';
import { logger } from '../inc/log.js';
import { increaseVersion } from '../packageManage/increaseVersion.js';

process.env.COREPACK_ENABLE_STRICT = '0';

export function usageString() {
	return `${pArgS('--bump')} ${pArgS('--json')} ${pDesc('本地运行npm pack并与npm上的最新版本对比差异')}`;
}
const args = {
	'--bump': '当发现更改时更新package.json，增加版本号0.0.1',
};
export function helpString() {
	return formatOptions(args);
}

export async function main() {
	process.env.LANG = 'C.UTF-8';
	process.env.LANGUAGE = 'C.UTF-8';

	const autoInc = argv.flag('--bump');
	const packageFile = resolve(process.cwd(), 'package.json');
	logger.log('目标包路径: %s', packageFile);

	const pkgJson = await readPackageJson(packageFile);
	const { changedFiles, hasChange, remoteVersion } = await executeChangeDetect(packageFile, pkgJson);

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
			logger.line();
			logger.log('%s', changedFiles.join('\n'));
			logger.line();
			console.log('changes: yes');
		}
	} else {
		console.log(JSON.stringify({ changedFiles, changed }));
	}
}
