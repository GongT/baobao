import { parse } from 'url';
import { convertCatchedError } from '@idlebox/common';
import { commandInPath } from '@idlebox/node';
import { command } from 'execa';
import { errorLog, log } from '../inc/log';

let foundPm: string;

export async function getPackageManager() {
	if (foundPm) {
		return foundPm;
	}
	for (const name of ['yarn', 'npm']) {
		if (await commandInPath(name).catch(() => false)) {
			return (foundPm = name);
		}
	}
	throw new Error('Failed to detect any package manager, please install npm/yarn/pnpm in PATH');
}

export async function detectRegistry(url: string): Promise<string> {
	if (url !== 'detect') {
		log('using registry url from commandline (%s)', url);

		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url.replace(/\/+$/, '');
		}

		errorLog('[!!] invalid argument: --registry: http: or https: is required');
		process.exit(1);
	}

	try {
		const pm = await getPackageManager();
		log('Using package manager: %s', pm);
		url = (await command(pm + ' config get registry', { stderr: 'ignore' })).stdout;
		log('    config get registry: %s', url);

		const u = parse(url);
		if (!u.protocol || !u.host) {
			errorLog('[!!] invalid config (registry=%s): url is invalid', url);
			process.exit(1);
		}
	} catch (e) {
		log('    [!!] error run config get: %s', convertCatchedError(e).message);
	}
	if (url) {
		return url.replace(/\/+$/, '');
	} else {
		return 'https://registry.npmjs.org';
	}
}
