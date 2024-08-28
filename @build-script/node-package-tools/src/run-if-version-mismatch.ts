import { exists } from '@idlebox/node';
import { execa } from 'execa';
import { resolve } from 'path';
import { getNewNpmCache } from './cache/native.npm';
import { getArg, pCmd } from './inc/getArg';
import { debug, errorLog, log } from './inc/log';
import { getNoProxyValue, getProxyValue } from './inc/proxy';
import { detectRegistry } from './packageManage/detectRegistry';

process.env.COREPACK_ENABLE_STRICT = '0';

export function usageString() {
	return `${pCmd('run-if-version-mismatch')} \x1B[38;5;9m--\x1B[0m command to run`;
}
export function helpString() {
	return `
  Note: the "--" is required
`;
}
export async function main(argv: string[]) {
	process.on('unhandledRejection', (reason, promise) => {
		debugger;
		console.error('got unhandledRejection: %s', reason);
		console.error(promise);
	});

	const startExtraArgs = argv.indexOf('--');
	const cmd = argv.splice(startExtraArgs + 1, Infinity);
	if (startExtraArgs === -1 || cmd.length === 0) {
		errorLog(
			'must have "--" in arguments, and follow command to run.\n  eg: run-if-version-mismatch --quiet -- pnpm publish',
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
	const registry = await detectRegistry(getArg('--registry', 'detect'), packagePath);

	const pkg = await getNewNpmCache(packageJson.name, distTag, registry);
	const version = pkg?.version;
	log('version = %s', version);

	if (!version || packageJson.version !== version) {
		log('local (%s) !== remote (%s), run command!', packageJson.version, version);
		debug('command: ' + cmd.join(' '));
		await execa(cmd[0]!, cmd.slice(1), {
			cwd: packagePath,
			stdout: 'inherit',
			stderr: 'inherit',
			env: {
				HTTP_PROXY: getProxyValue(),
				HTTPS_PROXY: getProxyValue(),
				NO_PROXY: getNoProxyValue(),
			},
		});

		debug('reveal npm cache...');
		await getNewNpmCache(packageJson.name, distTag, registry); // TODO: should no-cache
	} else {
		log('local (%s) === remote (%s), do nothing and exit.', packageJson.version, version);
	}
	return 0;
}
