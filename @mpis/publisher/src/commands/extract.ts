import { argv, CommandDefine, logger } from '@idlebox/cli';
import { emptyDir, shutdown, workingDirectory } from '@idlebox/node';
import { resolve } from 'node:path';
import { recreateTempFolder, repoRoot, tempDir } from '../common/constants.js';
import { execPnpmMute } from '../common/exec.js';
import { buildPackageTarball, extractPackage, getCurrentProject, reconfigurePackageJson } from '../common/shared-steps.js';
import { decompressTarGz } from '../common/tar.js';

export class Command extends CommandDefine {
	protected override _usage: string = '';
	protected override _description: string = '解压缩当前项目的tgz包';
	protected override _help: string = `
extract命令会执行以下步骤：
1. 解压缩tgz包到临时文件夹
2. 运行hook
3. 清理package.json
4. 解压到指定目录

`;
	protected override _arguments = {
		'--out': { flag: false, usage: true, description: '输出路径，默认为 ./.publisher/%s/' },
	};
}

export const main = async () => {
	const output = argv.single(['--out']);

	if (argv.unused().length > 0) {
		throw new Error(`Unknown arguments: ${argv.unused().join(', ')}`);
	}

	// prepare
	await recreateTempFolder();
	const pkgJson = getCurrentProject();

	// 运行build、打包
	await buildPackageTarball();

	// 解压缩到一个临时文件夹，其中解压缩步骤会运行hook
	const hookDir = await extractPackage('hook-working-directory');

	// 简单清理
	reconfigurePackageJson(hookDir);

	// 重新运行pnpm pack
	const tgzFile = resolve(tempDir, 'will-publish-package.tgz');
	await execPnpmMute(hookDir, ['pack', '--out', tgzFile]);
	logger.debug`已重新打包为 relative<${tgzFile}>`;

	// 执行解压
	const resultDirectory = output ? resolve(workingDirectory.cwd(), output) : resolve(repoRoot, '.publisher', pkgJson.name);
	await emptyDir(resultDirectory);
	await decompressTarGz(tgzFile, resultDirectory);
	logger.success`已解压到 relative<${resultDirectory}>`;

	shutdown(0);
};
