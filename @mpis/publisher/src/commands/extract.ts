import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { emptyDir } from '@idlebox/node';
import { resolve } from 'node:path';
import { getDecompressed, repoRoot, tempDir } from '../common/constants.js';
import { execPnpmMute } from '../common/exec.js';
import { makeTempPackage, reconfigurePackageJson } from '../common/shared-steps.js';
import { decompressTarGz } from '../common/tar.js';

if (argv.unused().length > 0) {
	throw new Error(`Unknown arguments: ${argv.unused().join(', ')}`);
}

await makeTempPackage();

const pkgJson = reconfigurePackageJson('pack');

const resultDirectory = resolve(repoRoot, '.publisher', pkgJson.name);
await emptyDir(resultDirectory);

const tempPackagePath = getDecompressed();
const tgzFile = resolve(tempDir, 'package.tgz');
await execPnpmMute(tempPackagePath, ['--silent', 'pack', '--out', tgzFile]);

logger.debug`已重新打包为 relative<${tgzFile}>`;

await decompressTarGz(tgzFile, resultDirectory);

logger.log`已解压到 relative<${resultDirectory}>`;

process.exit(0);
