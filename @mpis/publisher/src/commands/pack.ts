import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { resolve } from 'node:path';
import { getDecompressed } from '../common/constants.js';
import { execPnpmMute } from '../common/exec.js';
import { makeTempPackage, reconfigurePackageJson } from '../common/shared-steps.js';

const out = argv.single(['--out']) || '%s-%v.tgz';

if (argv.unused().length > 0) {
	throw new Error(`Unknown arguments: ${argv.unused().join(', ')}`);
}

await makeTempPackage();
const pkgJson = reconfigurePackageJson('pack');

const outFile = out.replace('%s', normalizeName(pkgJson.name)).replace('%v', pkgJson.version);
const outPath = resolve(process.cwd(), outFile);

const tempPackagePath = getDecompressed();
await execPnpmMute(tempPackagePath, ['--silent', 'pack', '--out', outPath]);

logger.log`已重新打包为 relative<${outPath}>`;

console.log(outPath);
process.exit(0);

function normalizeName(name: string): string {
	return name.replace(/^@/, '').replace(/\//g, '-');
}
