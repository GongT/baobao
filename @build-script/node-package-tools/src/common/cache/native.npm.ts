import { sleep, type IPackageJson } from '@idlebox/common';
import { get as cacheGet, rm as cacheRm } from 'cacache';
import { rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { json as npmFetchJson } from 'npm-registry-fetch';
import { logger } from '../functions/log.js';
import { DEFAULT_NPM_REGISTRY } from '../package-manager/constant.js';
import type { IPackageManager } from '../package-manager/package-manager.js';
import { downloadFileCached } from '../taball/file-download.js';
import { self_package_name, self_package_repository, self_package_version } from '../version.generated.js';
import { escapePackageNameToFilename } from './escape-package-path.js';

export interface IRegistryMetadata {
	_attachments: any;
	_id: string;
	_rev: string;
	author: IPackageJson['author'];
	description: string;
	'dist-tags': Record<string, string>;
	license: string;
	maintainers: IPackageJson['author'][];
	name: string;
	readme: string;
	time: {
		created: string;
		modified: string;
		[version: string]: string;
	};
	versions: Record<string, IPackageJson>;
	bugs: IPackageJson['bugs'];
	contributors: IPackageJson['contributors'];
	homepage: string;
	keywords: string[];
	repository: IPackageJson['repository'];
	_source_registry_name: string;
}

export class NpmCacheHandler {
	constructor(
		private readonly pm: IPackageManager,
		private readonly registry: string,
		public readonly path: string
	) {}

	deleteMetadata(name: string) {
		return deleteNpmCache(this.path, name, this.registry);
	}

	async fetchMetadata(name: string, cacheMode = CacheMode.Normal) {
		const registry = await this.pm.getNpmRegistry();
		return fetchNpmWithCache(this.path, name, registry, { mode: cacheMode });
	}

	async fetchVersion(name: string, distTag = 'latest', cacheMode = CacheMode.Normal) {
		const json = await this.fetchMetadata(name, cacheMode);
		if (!json) {
			return;
		}
		const version = getVersion(json, distTag);
		if (!version) {
			logger.log(` ! 找不到版本信息(${distTag})`);
			return;
		}
		return version;
	}

	private getTarballFile(name: string, tag: string) {
		const es = escapePackageNameToFilename(name);
		return resolve(this.path, `../node-package-tools/${es}-${tag}.tgz`);
	}

	public async downloadTarball(name: string, distTag: string) {
		const r = await this.fetchVersion(name, distTag);
		if (!r) {
			throw new Error(`无此版本: ${name} = ${distTag}`);
		}
		return await downloadFileCached(r.dist.tarball, this.getTarballFile(name, distTag));
	}

	public deleteTarball(name: string, distTag: string) {
		return rm(this.getTarballFile(name, distTag), { force: true });
	}
}

function getVersion(json: any, distTag: string): IPackageJson | undefined {
	const v = json?.['dist-tags']?.[distTag];
	if (!v) {
		return json.versions[distTag];
	}
	return json.versions[v];
}

// type NpmLog = Exclude<FetchOptions['log'], undefined>;

export enum CacheMode {
	Normal = 'normal',
	ForceNew = 'force-renew',
	Offline = 'offline',
}

interface IMyOpts {
	mode?: CacheMode;
	maxRetry?: number;
}
const defOpt: Required<IMyOpts> = {
	mode: CacheMode.Normal,
	maxRetry: 3,
};

export async function fetchNpmWithCache(path: string, name: string, registry: string, _options?: IMyOpts) {
	logger.debug(`   * npm-registry-fetch: ${registry} :: ${name}`);

	const options: Required<IMyOpts> = Object.assign({}, defOpt, _options);

	let try_cnt = 0;
	let retry = options.maxRetry;
	let retry_timeout = 500;
	let json: IRegistryMetadata | undefined;

	while (true) {
		try_cnt++;
		retry--;
		try {
			json = (await npmFetchJson(name, {
				cache: path,
				registry: registry,
				fetchRetries: 0,
				noProxy: false,
				preferOnline: options.mode === CacheMode.ForceNew,
				offline: options.mode === CacheMode.Offline,
				preferOffline: options.mode === CacheMode.Normal,
				timeout: 5000,
				userAgent: `${self_package_name}(${self_package_version}) GongT(${self_package_repository})`,
			})) as any;
			break;
		} catch (e: any) {
			if (!e || !e.message) {
				console.dir(e);
				throw new Error('npm fetch throw unexpected thing');
			}
			if (e.statusCode === 404) {
				logger.log('registry say 404, return empty.');
				return undefined;
			}
			if (e.code === 'ECONNRESET') retry++;

			if (retry <= 0) throw e;

			retry_timeout = (retry_timeout / 1000) * 1.2;
			if (retry_timeout > 15000) retry_timeout = 15000;
			logger.error(`failed fetch npm registry: ${e.message}, retry in ${(retry_timeout / 1000).toFixed(1)} seconds...`);
			await sleep(retry_timeout);
		}
	}

	if (!json) {
		logger.error('[!!] NPM cache structure changed!');
		process.exit(1);
	}

	return json;
}

async function deleteNpmCache(path: string, name: string, registry?: string) {
	const require = createRequire(import.meta.url);
	const cacheKey = require('make-fetch-happen/lib/cache/key.js');
	const registries = new Set([DEFAULT_NPM_REGISTRY, 'https://registry.npmmirror.com/']);
	if (registry) {
		if (!registry.endsWith('/')) {
			registry += '/';
		}
		registries.add(registry);
	}

	let deleted = false;
	logger.debug(`  - delete cache: ${name}`);
	let i = registries.size;
	for (const registry of registries.values()) {
		logger.debug(`     │ ${registry}${name}`);
		const cid = cacheKey({ url: `${registry}${name}` });

		i--;
		const tc = i > 0 ? '├' : '└';

		const info = await cacheGet.info(path, cid);
		// console.log(info);
		await cacheRm.content(path, cid);
		// @types/cacache 最后一个参数丢失
		await (cacheRm.entry as any)(path, cid, { removeFully: true });
		if (info) {
			logger.debug(`     ${tc}      deleted! ${cid}`);
			deleted = true;
		} else {
			logger.debug(`     ${tc}      not exists: ${cid}`);
		}
	}

	return deleted;
}
