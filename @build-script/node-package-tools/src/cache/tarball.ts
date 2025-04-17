import { exists, streamToBuffer } from '@idlebox/node';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { readJsonSync } from '../inc/fs.js';
import { downloadFile, HttpError, INormalizedResponse } from '../inc/http.js';
import { logger } from '../inc/log.js';
import { cachedir } from './location.js';
import { getNewNpmCache } from './native.npm.js';

type IResult = {
	version: string;
	tarball: string;
};

const memCache = new Map<string, IResult>();

export async function getWithoutCache(name: string, distTag: string, registry: string): Promise<string | undefined> {
	const cid = name + '@' + distTag;
	memCache.delete(cid);
	const r = await getNewNpmCache(name, distTag, registry);
	return r?.version;
}

export async function getVersionCached(name: string, distTag: string, registry: string): Promise<string | undefined> {
	const r = await getWithCache(name, distTag, registry);
	return r?.version;
}

export async function getTarballCached(name: string, distTag: string, registry: string): Promise<string | undefined> {
	const r = await getWithCache(name, distTag, registry);
	return r?.tarball;
}

async function getWithCache(name: string, distTag: string, registry: string): Promise<IResult | undefined> {
	const cid = name + '@' + distTag;
	if (memCache.has(cid)) {
		return memCache.get(cid);
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
	return ret || undefined;
}
async function _getCustomCache(name: string, distTag: string, registry: string): Promise<null | IResult> {
	logger.log('从头npm获取包信息: %s', `${registry}/${name}`);

	const cache = resolve(cachedir(), name.replace(/[@\/]/g, '_') + '.package.cache.json');
	let etag: string = '',
		json: any;
	if (await exists(cache)) {
		logger.log('    缓存文件存在:\n      %s', cache);
		const data = readJsonSync(cache);
		etag = data.etag;
		json = data.json;
	}
	const headers: any = {
		'user-agent': 'idlebox',
	};
	if (etag) {
		headers['If-None-Match'] = etag;
		logger.log('    etag = %s', etag);
	}

	let response: INormalizedResponse;
	try {
		response = await downloadFile(`${registry}/${name}`, headers);
	} catch (e: any) {
		if (HttpError.is(e)) {
			logger.log('    响应HTTP %s(错误)', e.code);
			if (e.code === 404) {
				return null;
			} else if (e.code === 304) {
				return resultOf(json, distTag);
			} else {
				logger.error(`请求npm注册表失败: ${registry}/${name}: ${e.message}`);
				throw e;
			}
		} else {
			logger.error(`请求npm注册表失败: ${registry}/${name}: ${e.message}`);
			throw e;
		}
	}

	logger.log('    响应 HTTP %s', response.statusCode);

	try {
		json = JSON.parse(await streamToBuffer(response.stream, false));
	} catch (e: any) {
		logger.error(`解析npm注册表响应失败: ${registry}/${name}: ${e.message}`);
	}
	logger.log('        dist-tags: %s', json['dist-tags']);
	logger.log('        etag: %s', response.headers['etag']);

	if (response.headers['etag']) {
		etag = response.headers['etag'];

		logger.log('写入缓存文件 -> ', cache);

		await mkdir(dirname(cache), { recursive: true });
		await writeFile(cache, JSON.stringify({ etag, json }), 'utf-8');
	} else {
		logger.error(`npm注册表响应中缺少etag头: ${registry}/${name}`);
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
