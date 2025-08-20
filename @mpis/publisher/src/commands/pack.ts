import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { recreateTempFolder } from '../common/constants.js';
import { execPnpmMute } from '../common/exec.js';
import { normalizeName } from '../common/path.js';
import { buildPackageTarball, extractPackage, getCurrentProject, reconfigurePackageJson } from '../common/shared-steps.js';

const out = argv.single(['--out']) || '%s-%v.tgz';

if (argv.unused().length > 0) {
	throw new Error(`Unknown arguments: ${argv.unused().join(', ')}`);
}

// prepare
await recreateTempFolder();
const pkgJson = getCurrentProject();

// 运行build、打包
await buildPackageTarball();

// 解压缩到临时文件夹，其中解压缩步骤会运行hook
const extractDir = await extractPackage('hook-working-directory');

// 简单清理
reconfigurePackageJson(extractDir);

// 重新运行pnpm pack
const tgzFile = out.replace('%s', normalizeName(pkgJson.name)).replace('%v', pkgJson.version);
await execPnpmMute(extractDir, ['pack', '--out', tgzFile]);
logger.debug`已重新打包为 relative<${tgzFile}>`;

// ok
console.log(tgzFile);
shutdown(0);
