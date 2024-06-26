import { convertCatchedError } from '@idlebox/common';
import { PathEnvironment, commandInPath } from '@idlebox/node';
import { execaCommand } from 'execa';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { errorLog, log } from '../inc/log';

let foundPm: string;

export async function getPackageManager() {
	if (foundPm) {
		return foundPm;
	}
	for (const name of ['pnpm', 'yarn', 'npm']) {
		if (await commandInPath(name).catch(() => false)) {
			return (foundPm = name);
		}
	}

	const pathVar = new PathEnvironment();
	console.log('current PATH: (' + process.env.PATH + ')\n  - ' + [...pathVar.values()].join('\n  - '));
	throw new Error('Failed to detect any package manager, please install npm/yarn/pnpm in PATH');
}

export async function detectRegistry(url: string, currentProjectPath: string): Promise<string> {
	if (url !== 'detect') {
		log('using registry url from commandline (%s)', url);

		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url.replace(/\/+$/, '');
		}

		errorLog('[!!] invalid argument: --registry: http: or https: is required');
		process.exit(1);
	}

	try {
		url = await resolveRegistry(currentProjectPath);
	} catch (e) {
		log('    [!!] error run config get: %s', convertCatchedError(e).message);
	}
	if (url) {
		const u = new URL(url);
		if (!u.protocol || !u.host) {
			errorLog('[!!] invalid config (registry=%s): url is invalid', url);
			process.exit(1);
		}

		url = url.replace(/\/+$/, '');
		log('using registry url from config file (%s)', url);
		return url;
	} else {
		url = 'https://registry.npmjs.org';
		log('using default registry url (%s)', url);
		return url;
	}
}

async function resolveRegistry(path: string) {
	let url: string;
	const pm = await getPackageManager();
	log('Using package manager: %s', pm);

	const pkgJson = JSON.parse(await readFile(resolve(path, 'package.json'), 'utf-8'));
	const scope = pkgJson.name.startsWith('@') ? pkgJson.name.replace(/\/.+$/, '') : '';
	log('    package scope: %s', scope);
	if (scope) {
		url = (await execaCommand(pm + ' config get ' + scope + ':registry', { stderr: 'ignore', cwd: path })).stdout;
		log('    config get registry (scope): %s', url);
		if (url !== 'undefined') {
			return url.trim();
		}
	}

	url = (await execaCommand(pm + ' config get registry', { stderr: 'ignore', cwd: path })).stdout;
	log('    config get registry: %s', url);

	return url.trim();
}
