import { exists } from '@idlebox/node-helpers';
import * as execa from 'execa';
import { resolve } from 'path';
import { detectRegistry } from './detectRegistry';
import { getArg } from './getArg';
import { getVersionCached } from './getVersionCached';
import { errorLog, log } from './log';

export async function main(argv: string[]) {
	const startExtraArgs = argv.indexOf('--');
	const cmd = argv.splice(startExtraArgs + 1, Infinity);
	if (startExtraArgs === -1 || cmd.length === 0) {
		errorLog(
			'must have "--" in arguments, and follow command to run.\n  eg: run-if-version-mismatch --quiet -- yarn publish'
		);
		return 22;
	}
	log('will run command: %s', cmd.join(' '));

	const packagePath = resolve(process.cwd(), getArg('--package', './'));
	log('working at %s', packagePath);

	const packageFile = resolve(packagePath, 'package.json');

	if (!(await exists(packageFile))) {
		errorLog('No package.json found');
		return 1;
	}
	const packageJson = require(packageFile);
	log('package.name = %s', packageJson.name);

	const distTag = getArg('--dist-tag', 'latest');
	const registry = await detectRegistry(getArg('--registry', 'detect'));

	const result = await getVersionCached(packageJson.name, distTag, registry);
	log('version = %s', result.version);

	if (!result.version || packageJson.version !== result.version) {
		log('local (%s) !== remote (%s), run command!', packageJson.version, result.version);
		await execa(cmd[0], cmd.slice(1), { cwd: packagePath, stdout: 'inherit', stderr: 'inherit' });
	} else {
		log('local (%s) === remote (%s), do nothing and exit.', packageJson.version, result.version);
	}
	return 0;
}
