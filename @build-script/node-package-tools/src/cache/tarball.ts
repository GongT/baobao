import { exists, streamToBuffer } from '@idlebox/node';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { readJsonSync } from '../inc/fs';
import { downloadFile, HttpError, INormalizedResponse } from '../inc/http';
import { errorLog, log } from '../inc/log';
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
	log('从头npm获取包信息: %s', `${registry}/${name}`);

	const cache = resolve(cachedir(), name.replace(/[@\/]/g, '_') + '.package.cache.json');
	let etag: string = '',
		json: any;
	if (await exists(cache)) {
		log('    缓存文件存在:\n      %s', cache);
		const data = readJsonSync(cache);
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

	let response: INormalizedResponse;
	try {
		response = await downloadFile(`${registry}/${name}`, headers);
	} catch (e: any) {
		if (HttpError.is(e)) {
			log('    响应HTTP %s(错误)', e.code);
			if (e.code === 404) {
				return null;
			} else if (e.code === 304) {
				return resultOf(json, distTag);
			} else {
				errorLog(`请求npm注册表失败: ${registry}/${name}: ${e.message}`);
				throw e;
			}
		} else {
			errorLog(`请求npm注册表失败: ${registry}/${name}: ${e.message}`);
			throw e;
		}
	}

	log('    响应 HTTP %s', response.statusCode);

	try {
		json = JSON.parse(await streamToBuffer(response.stream, false));
	} catch (e: any) {
		errorLog(`解析npm注册表响应失败: ${registry}/${name}: ${e.message}`);
	}
	log('        dist-tags: %s', json['dist-tags']);
	log('        etag: %s', response.headers['etag']);

	if (response.headers['etag']) {
		etag = response.headers['etag'];

		log('写入缓存文件 -> ', cache);

		await mkdir(dirname(cache), { recursive: true });
		await writeFile(cache, JSON.stringify({ etag, json }), 'utf-8');
	} else {
		errorLog(`npm注册表响应中缺少etag头: ${registry}/${name}`);
	}

	return resultOf(json, distTag);
}

function resultOf(json: any, tag: string): null | IResult {
	const version = json['dist-tags']?.[tag];
	if (!version) {
		return null;
	}

	const current = json.versions[version];
	if (!current || !current.dist.tarball) {
		throw new Error('JSON似乎无效: 缺少version: ' + version);
	}
	return { version, tarball: current.dist.tarball };
}
