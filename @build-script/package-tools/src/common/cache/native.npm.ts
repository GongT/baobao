import { logger as defaultLogger, type IMyLogger } from '@idlebox/cli';
import { background, sleep, type CancellationToken, type IPackageJson } from '@idlebox/common';
import { get as cacheGet, rm as cacheRm } from 'cacache';
import { rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { json as npmFetchJson } from 'npm-registry-fetch';
import { DEFAULT_NPM_REGISTRY } from '../package-manager/constant.js';
import type { IPackageManager } from '../package-manager/package-manager.js';
import { getProxyValue } from '../package-manager/proxy.js';
import { FileDownloader } from '../taball/file-download.js';
import { userAgent } from '../version.generated.js';
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
	private readonly cache_path;

	constructor(
		private readonly pm: IPackageManager,
		private readonly registry: string,
		public readonly path: string,
		public readonly logger = defaultLogger,
	) {
		this.cache_path = resolve(path, '_cacache');
	}

	deleteMetadata(name: string) {
		return deleteNpmCache(this.cache_path, name, this.registry, this.logger);
	}

	async fetchMetadata(name: string, cacheMode = CacheMode.Normal, abort?: CancellationToken) {
		const registry = await this.pm.getNpmRegistry();
		return fetchNpmWithCache(this.cache_path, name, registry, { mode: cacheMode, logger: this.logger, abort });
	}

	async fetchVersion(name: string, distTag = 'latest', cacheMode = CacheMode.Normal, abort?: CancellationToken) {
		const json = await this.fetchMetadata(name, cacheMode, abort);
		if (!json) {
			return;
		}
		const version = getVersion(json, distTag);
		if (!version) {
			this.logger.warn(` ! 找不到版本信息(${name}@${distTag})`);
			return;
		}
		return version;
	}

	private getTarballFile(name: string, tag: string) {
		const es = escapePackageNameToFilename(name);
		return resolve(this.path, `package-tools/${es}-${tag}.tgz`);
	}

	public async downloadTarball(name: string, distTag: string, abort?: CancellationToken) {
		const r = await this.fetchVersion(name, distTag, CacheMode.Normal, abort);
		if (!r) {
			throw new Error(`无此版本: ${name} = ${distTag}`);
		}
		const d = new FileDownloader(this.logger);

		const p = d.download(r.dist.tarball, this.getTarballFile(name, distTag));

		// 下载过程是无法中途取消的

		return await background(p, abort);
	}

	public deleteTarball(name: string, distTag: string) {
		return rm(this.getTarballFile(name, distTag), { force: true });
	}
}

function getVersion(json: any, distTag: string): IPackageJson | undefined {
	if (!json.versions) {
		return undefined;
	}
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
	logger?: IMyLogger;
	abort?: CancellationToken;
}
const defOpt: Omit<Required<IMyOpts>, 'abort'> = {
	mode: CacheMode.Normal,
	maxRetry: 3,
	logger: defaultLogger,
};

export function fetchNpmWithCache(path: string, name: string, registry: string, options?: IMyOpts) {
	if (options?.abort) {
		const result = _fetchNpmWithCache(path, name, registry, options);
		return Promise.race([result, options?.abort?.promise]);
	} else {
		return _fetchNpmWithCache(path, name, registry, options);
	}
}

async function _fetchNpmWithCache(path: string, name: string, registry: string, _options?: IMyOpts) {
	const { logger, abort, ...options } = Object.assign({}, defOpt, _options);

	logger.debug(`   * npm-registry-fetch: ${registry} :: ${name}`);

	let _try_cnt = 0;
	let retry = options.maxRetry;
	let retry_timeout = 500;
	let json: IRegistryMetadata | undefined;

	while (true) {
		_try_cnt++;
		retry--;
		try {
			const proxy = getProxyValue(registry, logger);
			json = (await npmFetchJson(name, {
				cache: path,
				registry: registry,
				fetchRetries: 0,
				noProxy: false,
				preferOnline: options.mode === CacheMode.ForceNew,
				offline: options.mode === CacheMode.Offline,
				preferOffline: options.mode === CacheMode.Normal,
				proxy: proxy,
				timeout: 5000,
				userAgent: userAgent,
			})) as any;
			break;
		} catch (e: any) {
			abort?.throwIfCanceled(e);

			if (!e?.message) {
				console.dir(e);
				throw new Error('npm-registry-fetch抛出无法识别的异常类型');
			}
			if (e.statusCode === 404) {
				logger.verbose('npm registry返回 404, 返回 undefined.');
				return undefined;
			}
			if (e.code === 'ECONNRESET') retry++;

			if (retry <= 0) throw e;

			retry_timeout = retry_timeout * 1.2;
			if (retry_timeout > 15000) retry_timeout = 15000;
			logger.error(`无法请求npm registry: ${e.message}, 等待 ${(retry_timeout / 1000).toFixed(1)} 秒后重试...`);
			await sleep(retry_timeout);
		}
	}

	if (!json) {
		logger.error('[!!] NPM 缓存结构发生变化!');
		process.exit(1);
	}

	return json;
}

async function deleteNpmCache(path: string, name: string, registry?: string, logger: IMyLogger = defaultLogger) {
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
	logger.debug(`  - 删除缓存: ${name}`);
	let i = registries.size;
	for (const registry of registries.values()) {
		logger.debug(`     │ ${registry}${name}`);
		const cid = cacheKey({ url: `${registry}${name}` });

		i--;
		const tc = i > 0 ? '├' : '└';

		const info = await cacheGet.info(path, cid);
		logger.verbose(`缓存信息: ${info}`);
		await cacheRm.content(path, cid);
		await cacheRm.entry(path, cid);
		// @types/cacache 最后一个参数丢失
		await (cacheRm.entry as any)(path, cid, { removeFully: true });
		if (info) {
			logger.debug(`     ${tc}      删除! ${cid}`);
			deleted = true;
		} else {
			logger.debug(`     ${tc}      不存在: ${cid}`);
		}
	}

	return deleted;
}
