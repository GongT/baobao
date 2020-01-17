import * as commandExists from 'command-exists';
import { command } from 'execa';
import { log } from './log';

let foundPm: string;

export async function getPackageManager() {
	if (foundPm) {
		return foundPm;
	}
	for (const name of ['npm', 'yarn', 'pnpm']) {
		if (await commandExists(name)) {
			return (foundPm = name);
		}
	}
	throw new Error('Failed to detect any package manager, please install npm/yarn/pnpm in PATH');
}

export async function detectRegistry(url: string): Promise<string> {
	if (url !== 'detect') {
		log('using registry url from commandline');
		return url;
	}

	try {
		const pm = await getPackageManager();
		log('using package manager: %s', pm);
		url = (await command(pm + ' config get registry', { stderr: 'ignore' })).stdout;
		log('config get registry: %s', url);
	} catch (e) {
		log('error run config get: %s', e.message);
	}
	return url || 'https://registry.npmjs.org';
}
