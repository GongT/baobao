import { checkChildProcessResult } from '@idlebox/node';
import { execa } from 'execa';
import { lt } from 'semver';
import type { ArgsReader } from '../../../../@idlebox/args/lib/esm/library/args-reader.js';
import { CacheMode } from '../common/cache/native.npm.js';
import { distTagInput, formatOptions, pArgS, pDesc } from '../common/functions/cli.js';
import { logger } from '../common/functions/log.js';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';

process.env.COREPACK_ENABLE_STRICT = '0';

export function usageString() {
	return `${pArgS('--no-cache')} ${pArgS('--flush')} \x1B[38;5;9m--\x1B[0m command to run`;
}
const args = {
	'--no-cache': '禁用缓存',
	'--flush': '程序成功退出时自动删除npm缓存',
	'--newer': '只有在本地版本号大于远程版本号时才运行（默认只要不同就运行）',
};
export function helpString() {
	return `${pDesc('如果package.json中的version与npm上的版本(latest)不一致，则运行命令')}
  注意: 命令行中的"--"是必须的
${formatOptions(args)}
`;
}
export async function main(argv: ArgsReader) {
	const noCache = argv.flag('--no-cache') > 0;
	const flushCache = argv.flag('--flush') > 0;
	const onlyNewer = argv.flag('--newer') > 0;

	const commands = argv.unused();
	if (commands.length === 0 || !process.argv.includes('--')) {
		logger.error(
			'参数中必须包含"--"，并且后面跟随要运行的命令。\n  示例: run-if-version-mismatch --quiet -- pnpm publish'
		);
		return 22;
	}
	logger.debug('即将运行命令: %s', commands.join(' '));

	const packageManager = await createPackageManager(PackageManagerUsageKind.Read);

	const packagePath = await packageManager.workspace.getNearestPackage();
	logger.log('工作目录: %s', packagePath);

	const packageJson = await packageManager.loadPackageJson();
	logger.log('包名: %s', packageJson.name);

	const cache = await packageManager.createCacheHandler();
	const pkg = await cache.fetchVersion(packageJson.name, distTagInput, noCache ? CacheMode.ForceNew : CacheMode.Normal);
	const rversion = pkg?.version;
	logger.log('远程版本: %s', rversion);

	if (rversion) {
		if (rversion === packageJson.version) {
			logger.log('本地版本 (%s) === 远程版本 (%s)，无需操作，直接退出。', packageJson.version, rversion);
			return 0;
		}
		if (onlyNewer && lt(packageJson.version, rversion)) {
			logger.log('本地版本 (%s) < 远程版本 (%s)，无需操作，直接退出。', packageJson.version, rversion);
			return 0;
		}
	}

	logger.log('本地版本 (%s) !== 远程版本 (%s)，开始执行命令!', packageJson.version, rversion);
	const r = await execa(commands[0], commands.slice(1), {
		cwd: packagePath,
		stdout: 'inherit',
		stderr: 'inherit',
	});

	checkChildProcessResult(r);

	if (flushCache) {
		logger.log('刷新npm缓存...');
		await cache.deleteMetadata(packageJson.name);
	}

	return 0;
}
