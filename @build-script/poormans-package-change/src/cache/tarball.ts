import { dirname, resolve } from 'path';
import { exists } from '@idlebox/node';
import { mkdirp, writeFile } from 'fs-extra';
import { get, ResponseAsJSON } from 'request';
import { log } from '../inc/log';
import { cachedir } from './location';
import { getNewNpmCache } from './native.npm';

type IResult = {
	version: string;
	tarball: string;
};

const memCache = new Map<string, IResult>();

export async function getVersionCached(name: string, distTag: string, registry: string): Promise<string | null> {
	const r = await getWithCache(name, distTag, registry);
	return r?.version ?? null;
}
export async function getTarballCached(name: string, distTag: string, registry: string): Promise<string | null> {
	const r = await getWithCache(name, distTag, registry);
	return r?.tarball ?? null;
}

async function getWithCache(name: string, distTag: string, registry: string): Promise<IResult | null> {
	const cid = name + '@' + distTag;
	if (memCache.has(cid)) {
		return memCache.get(cid)!;
	}

	const data = await getNewNpmCache(name, distTag, registry);
	if (data) {
		const ret: IResult = {
			tarball: data.dist.tarball,
			version: data.version,
		};
		memCache.set(cid, ret);
		return ret;
	}

	const ret = await _getCustomCache(name, distTag, registry);
	if (ret) {
		memCache.set(cid, ret);
	}
	return ret;
}
async function _getCustomCache(name: string, distTag: string, registry: string): Promise<null | IResult> {
	log('Fetching npm registry: %s', `${registry}/${name}`);

	const cache = resolve(cachedir(), name.replace(/[@\/]/g, '_') + '.package.cache.json');
	let etag: string = '',
		json: any;
	if (await exists(cache)) {
		log('    cache file exists:\n      %s', cache);
		const data = require(cache);
		etag = data.etag;
		json = data.json;
	}
	const headers: any = {
		'user-agent': 'idlebox',
	};
	if (etag) {
		headers['If-None-Match'] = etag;
		log('    etag = %s', etag);
	}

	const response: ResponseAsJSON = await new Promise((resolve, reject) => {
		get(
			`${registry}/${name}`,
			{
				headers,
				followRedirect: true,
				maxRedirects: 5,
				gzip: true,
				json: true,
			},
			(err, response) => (err ? reject(err) : resolve(response))
		);
	});

	log('    response HTTP %s', response.statusCode);
	if (response.statusCode === 404) {
		return null;
	}
	if (response.statusCode === 304) {
		return resultOf(json, distTag);
	}
	if (response.statusCode !== 200) {
		throw new Error(`HTTP ${response.statusCode}\n${response.body}`);
	}
	log('        dist-tags: %s', response.body['dist-tags']);
	log('        etag: %s', response.headers['etag']);

	json = response.body;
	etag = response.headers['etag'];

	log('write cache file -> ', cache);

	await mkdirp(dirname(cache));
	await writeFile(cache, JSON.stringify({ etag, json }), 'utf-8');

	return resultOf(json, distTag);
}

function resultOf(json: any, tag: string): null | IResult {
	const version = json['dist-tags']?.[tag];
	if (!version) {
		return null;
	}

	const current = json.versions[version];
	if (!current || !current.dist.tarball) {
		throw new Error('Json seems invalid: no version: ' + version);
	}
	return { version, tarball: current.dist.tarball };
}
