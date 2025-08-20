import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { emptyDir, shutdown } from '@idlebox/node';
import { resolve } from 'node:path';
import { recreateTempFolder, repoRoot, tempDir } from '../common/constants.js';
import { execPnpmMute } from '../common/exec.js';
import { buildPackageTarball, extractPackage, getCurrentProject, reconfigurePackageJson } from '../common/shared-steps.js';
import { decompressTarGz } from '../common/tar.js';

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
const resultDirectory = resolve(repoRoot, '.publisher', pkgJson.name);
await emptyDir(resultDirectory);
await decompressTarGz(tgzFile, resultDirectory);
logger.success`已解压到 relative<${resultDirectory}>`;

shutdown(0);
