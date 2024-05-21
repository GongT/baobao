import { execaSync } from 'execa';
import { json as npmFetchJson } from 'npm-registry-fetch';
import { resolve } from 'path';
import { errorLog } from '../inc/log';
import { ifExists, spawnOpts } from './helper';

let cachePathFound = false;
let npmCachePath = '';

function findCachePath() {
	cachePathFound = true;
	npmCachePath = ifExists(execaSync('npm', ['config', 'get', 'cache'], spawnOpts).stdout);
	npmCachePath = resolve(npmCachePath, '_cacache');
}

export function findNpmCachePath() {
	if (cachePathFound) {
		return npmCachePath;
	}
	findCachePath();
	return npmCachePath;
}

interface IPackageJson {
	version: string;
	dist: {
		tarball: string;
	};
}

function getByDistTag(json: any, distTag: string): IPackageJson | null {
	const v = json?.['dist-tags']?.[distTag];
	if (!v) {
		return null;
	}
	return json.versions[v];
}

export async function getNewNpmCache(name: string, distTag: string, registry: string) {
	console.error(`     * npm-registry-fetch: ${registry} :: ${name} @ ${distTag}`);
	const json = await npmFetchJson(name, { cache: findNpmCachePath(), registry: registry, preferOnline: true });
	if (!json) {
		errorLog('[!!] NPM cache structure changed!');
		process.exit(1);
	}

	return getByDistTag(json, distTag);
}
