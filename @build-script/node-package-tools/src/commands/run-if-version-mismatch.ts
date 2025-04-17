import { exists } from '@idlebox/node';
import { execa } from 'execa';
import { resolve } from 'path';
import type { ArgsReader } from '../../../../@idlebox/args/lib/esm/library/args-reader.js';
import { getNewNpmCache } from '../cache/native.npm.js';
import { readJsonSync } from '../inc/fs.js';
import { distTagInput, registryInput } from '../inc/getArg.js';
import { logger } from '../inc/log.js';
import { getNoProxyValue, getProxyValue } from '../inc/proxy.js';
import { detectRegistry } from '../packageManage/detectRegistry.js';

process.env.COREPACK_ENABLE_STRICT = '0';

export function usageString() {
	return `\x1B[38;5;9m--\x1B[0m command to run`;
}

export function helpString() {
	return `
  注意: 命令行中的"--"是必须的
`;
}
export async function main(argv: ArgsReader) {
	const commands = argv.unused();
	if (commands[0] !== '--' || commands.length <= 1) {
		logger.error(
			'参数中必须包含"--"，并且后面跟随要运行的命令。\n  示例: run-if-version-mismatch --quiet -- pnpm publish'
		);
		return 22;
	}
	logger.log('即将运行命令: %s', commands.join(' '));

	const packagePath = process.cwd();
	logger.log('工作目录: %s', packagePath);

	const packageFile = resolve(packagePath, 'package.json');

	if (!(await exists(packageFile))) {
		logger.error('未找到package.json文件');
		return 1;
	}
	const packageJson = readJsonSync(packageFile);
	logger.log('包名: %s', packageJson.name);

	const registry = await detectRegistry(registryInput, packagePath);

	const pkg = await getNewNpmCache(packageJson.name, distTagInput, registry);
	const version = pkg?.version;
	logger.log('远程版本: %s', version);

	if (!version || packageJson.version !== version) {
		logger.log('本地版本 (%s) !== 远程版本 (%s)，开始执行命令!', packageJson.version, version);
		logger.debug('执行的命令: ' + commands.join(' '));
		await execa(commands[0], commands.slice(1), {
			cwd: packagePath,
			stdout: 'inherit',
			stderr: 'inherit',
			env: {
				HTTP_PROXY: getProxyValue(),
				HTTPS_PROXY: getProxyValue(),
				NO_PROXY: getNoProxyValue(),
			},
		});

		logger.debug('刷新npm缓存...');
		await getNewNpmCache(packageJson.name, distTagInput, registry); // TODO: should no-cache
	} else {
		logger.log('本地版本 (%s) === 远程版本 (%s)，无需操作，直接退出。', packageJson.version, version);
	}
	return 0;
}
