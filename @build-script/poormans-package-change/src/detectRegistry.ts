import { command } from 'execa';
import { log } from './log';
import { commandInPath } from '@idlebox/node';

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
		return url;
	}

	try {
		const pm = await getPackageManager();
		log('Using package manager: %s', pm);
		url = (await command(pm + ' config get registry', { stderr: 'ignore' })).stdout;
		log('    config get registry: %s', url);
	} catch (e) {
		log('    [!!] error run config get: %s', e.message);
	}
	return url || 'https://registry.npmjs.org';
}
