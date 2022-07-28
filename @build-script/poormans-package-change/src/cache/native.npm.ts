import { get } from 'cacache';
import { execa, execaSync } from 'execa';
import { debug, errorLog, log } from '../inc/log';
import { ifExists, spawnOpts } from './helper';

let cachePathFound = false;
let npmCachePath = '';
const npmCacheIdPrefix = 'make-fetch-happen:request-cache:';

function findCachePath() {
	cachePathFound = true;
	npmCachePath = ifExists(execaSync('npm', ['config', 'get', 'cache'], spawnOpts).stdout);
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

async function getNpmCacheData(packageName: string, registry: string): Promise<Buffer | null> {
	if (!cachePathFound) {
		findCachePath();
	}
	if (!npmCachePath) {
		return null;
	}
	const cacheId = `${npmCacheIdPrefix}${registry}/${packageName.replace(/\//g, '%2f')}`;
	try {
		debug('[cache]     get cache: %s/_cacache :: %s', npmCachePath, cacheId);
		const cache = await get(npmCachePath + '/_cacache', cacheId);
		return cache.data;
	} catch {
		return null;
	}
}
async function getNpmCacheJson(packageName: string, registry: string): Promise<any | null> {
	const cache = await getNpmCacheData(packageName, registry);
	if (!cache) {
		return null;
	}
	try {
		const data = cache.toString('utf-8');
		return JSON.parse(data);
	} catch {
		return null;
	}
}

export async function getNewNpmCache(name: string, distTag: string, registry: string) {
	console.error(`     * npm show ${name}@${distTag}`);
	await execa('npm', ['show', `--registry=${registry}`, `${name}@${distTag}`], spawnOpts);
	const json = await getNpmCacheJson(name, registry);
	if (!json) {
		errorLog('[!!] NPM cache structure changed!');
		process.exit(1);
	}

	return getByDistTag(json, distTag);
}

export async function getNpmCache(packageName: string, distTag: string, registry: string): Promise<string[]> {
	const json = await getNpmCacheJson(packageName, registry);
	if (!json) {
		return [];
	}
	const obj = getByDistTag(json, distTag);
	if (obj) {
		log('[cache]     NPM: %s', obj.version);
		return [obj.version];
	} else {
		return [];
	}
}
