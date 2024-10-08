import { sleep } from '@idlebox/common';
import { execaSync } from 'execa';
import { json as npmFetchJson } from 'npm-registry-fetch';
import { resolve } from 'path';
import { errorLog, log } from '../inc/log';
import { getProxyValue } from '../inc/proxy';
import { self_package_name, self_package_repository, self_package_version } from '../inc/version.generated';
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

// type NpmLog = Exclude<FetchOptions['log'], undefined>;

export async function getNewNpmCache(name: string, distTag: string, registry: string) {
	log(`     * npm-registry-fetch: ${registry} :: ${name} @ ${distTag}`);
	log(`       http proxy: %s`, getProxyValue() || 'not use');

	let try_cnt = 0,
		retry = 3,
		retry_timeout = 500;
	let json;

	while (true) {
		try_cnt++;
		retry--;
		try {
			json = await npmFetchJson(name, {
				cache: findNpmCachePath(),
				registry: registry,
				fetchRetries: 0,
				noProxy: false,
				preferOnline: false,
				offline: false,
				preferOffline: false,
				timeout: 5000,
				userAgent: `${self_package_name}(${self_package_version}) GongT(${self_package_repository})`,
			});
			break;
		} catch (e: any) {
			if (!e || !e.message) {
				console.dir(e);
				throw new Error('npm fetch throw unexpected thing');
			}
			if (e.statusCode === 404) {
				log(`registry say 404, return mock version.`);
				return { name, version: '0.0.0-alpha', dist: { tarball: '' } } as IPackageJson;
			}
			if (e.code === 'ECONNRESET') retry++;

			if (retry <= 0) throw e;

			retry_timeout = (retry_timeout / 1000) * 1.2;
			if (retry_timeout > 15000) retry_timeout = 15000;
			errorLog(
				`failed fetch npm registry: ${e.message}, retry in ${(retry_timeout / 1000).toFixed(1)} seconds...`,
			);
			await sleep(retry_timeout);
		}
	}

	if (!json) {
		errorLog('[!!] NPM cache structure changed!');
		process.exit(1);
	}

	return getByDistTag(json, distTag);
}
