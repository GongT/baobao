/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */

import { argv } from '@idlebox/args/default';
import { getDecompressed } from '../common/constants.js';
import { execPnpmUser } from '../common/exec.js';
import { makeTempPackage, reconfigurePackageJson } from '../common/shared-steps.js';

const publishArgs: string[] = [];

if (argv.single('--access')) {
	publishArgs.push('--access', argv.single('--access')!);
}
if (argv.flag('--dry-run') > 0) {
	publishArgs.push('--dry-run');
}
if (argv.flag('--force') > 0) {
	publishArgs.push('--force');
}
if (argv.flag('--no-git-checks') > 0) {
	publishArgs.push('--no-git-checks');
}
if (argv.single('--publish-branch')) {
	publishArgs.push('--publish-branch', argv.single('--publish-branch')!);
}
if (argv.flag('--report-summary') > 0) {
	publishArgs.push('--report-summary');
}
if (argv.single('--tag')) {
	publishArgs.push('--tag', argv.single('--tag')!);
}
if (argv.single('--registry')) {
	publishArgs.push('--registry', argv.single('--registry')!);
}

if (argv.unused().length > 0) {
	throw new Error(`Unknown arguments: ${argv.unused().join(', ')}`);
}

await makeTempPackage();
reconfigurePackageJson('pack');

const tempPackagePath = getDecompressed();
await execPnpmUser(tempPackagePath, ['publish', ...publishArgs]);
