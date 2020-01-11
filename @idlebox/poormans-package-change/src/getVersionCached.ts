import { exists } from '@idlebox/node-helpers';
import { mkdirp, writeFile } from 'fs-extra';
import { tmpdir } from 'os';
import { dirname, resolve } from 'path';
import { get, ResponseAsJSON } from 'request';
import { log } from './log';

export async function getVersionCached(name: string, distTag: string, registry: string): Promise<IResult> {
	const cache = resolve(tmpdir(), 'package-json-cache', name.replace(/[@\/]/g, '_') + '.cache.json');
	let etag: string = '', json: any;
	if (await exists(cache)) {
		log('cache file exists: %s', cache);
		const data = require(cache);
		etag = data.etag;
		json = data.json;
	}
	const headers: any = {
		'user-agent': 'idlebox',
	};
	if (etag) {
		headers['If-None-Match'] = etag;
		log('etag = %s', etag);
	}

	log('fetching... %s', `${registry}/${name}`);
	const response: ResponseAsJSON = await new Promise((resolve, reject) => {
		get(`${registry}/${name}`, {
			headers,
			followRedirect: true,
			maxRedirects: 5,
			gzip: true,
			json: true,
		}, (err, response) => err ? reject(err) : resolve(response));
	});

	log('response HTTP %s', response.statusCode);
	if (response.statusCode === 404) {
		return { version: null };
	}
	if (response.statusCode === 304) {
		return resultOf(json, distTag);
	}
	if (response.statusCode !== 200) {
		throw new Error(`HTTP ${response.statusCode}\n${response.body}`);
	}
	log('dist-tags: %s', response.body['dist-tags']);
	log('etag: %s', response.headers['etag']);

	json = response.body;
	etag = response.headers['etag'];

	log('write cache file -> ', cache);

	await mkdirp(dirname(cache));
	await writeFile(cache, JSON.stringify({ etag, json }), 'utf-8');

	return resultOf(json, distTag);
}

type IResult = {
	version: null;
} | {
	version: string;
	tarball: string;
}

function resultOf(json: any, tag: string): IResult {
	const version = json['dist-tags'][tag];
	if (!version) {
		return { version: null };
	}

	const current = json.versions[version];
	if (!current || !current.dist.tarball) {
		throw new Error('Json seems invalid: no version: ' + version);
	}
	return { version, tarball: current.dist.tarball };
}
