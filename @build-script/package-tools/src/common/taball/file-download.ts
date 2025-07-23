import { sleep } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { exists, streamPromise } from '@idlebox/node';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import type { IncomingHttpHeaders, IncomingMessage, OutgoingHttpHeaders } from 'node:http';
import { get } from 'node:https';
import { dirname } from 'node:path';
import type { Readable } from 'node:stream';
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib';

interface IMetaInfo {
	headers: IncomingHttpHeaders;
	url: string;
}

export async function downloadFileCached(url: string, file: string) {
	const metadata = `${file}.meta.json`;
	logger.debug`下载文件:\n    地址: long<${url}>\n    保存到: long<${file}>`;
	let meta: IMetaInfo | undefined;
	if (await exists(metadata)) {
		try {
			meta = JSON.parse(await readFile(metadata, 'utf-8'));
		} catch {}

		if (meta?.url === url) {
			logger.log('     -> 已经下载');
			return file;
		}
	}
	const response = await http_stream(url);

	await mkdir(dirname(file), { recursive: true });
	const writeOut = createWriteStream(`${file}.downloading`);
	await streamPromise(response.stream.pipe(writeOut));

	meta = { headers: response.headers, url };
	await writeFile(metadata, JSON.stringify(meta), 'utf-8');

	await rename(`${file}.downloading`, file);
	logger.log('     -> 下载完成');

	return file;
}

class RedirectError extends Error {
	constructor(
		url: string,
		public readonly location: string,
		public readonly code: number,
	) {
		super(`Request ${url} - Redirect to "${location}" with code ${code}`);
	}

	static is(obj: any): obj is RedirectError {
		return obj instanceof RedirectError;
	}
}

export class HttpError extends Error {
	constructor(
		public readonly url: string,
		public readonly code: number,
		msg: string,
	) {
		super(`Request ${url} - Server responded with ${code}: ${msg}`);
	}

	static is(obj: any): obj is HttpError {
		return obj instanceof HttpError;
	}
}

type IStream = { stream: Readable };
export type INormalizedResponse = Omit<IncomingMessage, keyof Readable> & IStream;

async function http_stream(url: string, headers?: OutgoingHttpHeaders): Promise<INormalizedResponse> {
	let try_remain = 3;
	let redirect_cnt = 0;
	while (try_remain-- > 0) {
		try {
			return await send_request(url, headers || {});
		} catch (e: unknown) {
			if (RedirectError.is(e)) {
				redirect_cnt++;
				if (redirect_cnt > 8) {
					throw new HttpError(url, 0, '重定向次数过多');
				}

				logger.debug(`[http] 重定向到 ${e.location}`);
				url = e.location;
				try_remain++;
				continue;
			}

			logger.error('获取 %s 失败 [剩余尝试次数 %s]', url, try_remain);
			if (try_remain === 0) throw e;

			await sleep(2000);
		}
	}
	throw new Error('不可能的错误');
}

function send_request(url: string, headers: OutgoingHttpHeaders): Promise<any> {
	headers['Accept-Encoding'] = 'br,gzip,deflate';
	return new Promise<any>((resolve, reject) => {
		logger.debug(`[http] 请求 ${url}`);

		const request = get(url, { headers }, (response) => {
			logger.debug(
				`[http] 响应 ${response.statusCode} [encoding: ${response.headers['content-encoding']}][${response.headers['content-length']} bytes]`,
			);
			if (response.statusCode === 200) {
				const bytes = Number.parseInt(response.headers['content-length'] ?? '--');

				if (bytes > 5 * 1024 * 1024 && process.stderr.isTTY) {
					let downloaded = 0;
					response.on('data', (bs) => {
						downloaded += bs.length;
						process.stderr.write(
							`\x1B[2mdownload: ${downloaded} of ${bytes} bytes (${Math.round((downloaded / bytes) * 100)}%)\x1B[0m\r`,
						);
					});
					response.on('end', () => {
						process.stderr.write('\x1B[K');
					});
				}

				let stream: Readable;
				switch (response.headers['content-encoding']) {
					case 'br':
						stream = response.pipe(createBrotliDecompress());
						break;
					// Or, just use zlib.createUnzip() to handle both of the following cases:
					case 'gzip':
						stream = response.pipe(createGunzip());
						break;
					case 'deflate':
						stream = response.pipe(createInflate());
						break;
					default:
						stream = response;
						break;
				}
				resolve(Object.assign(response, { stream }));
			} else if (
				(response.statusCode === 302 ||
					response.statusCode === 301 ||
					response.statusCode === 303 ||
					response.statusCode === 307 ||
					response.statusCode === 308) &&
				response.headers.location
			) {
				reject(new RedirectError(url, response.headers.location, response.statusCode));
			} else {
				reject(new HttpError(url, response.statusCode as number, response.statusMessage as string));
			}
		});

		request.on('error', (err) => {
			reject(err);
		});
		request.end();
	});
}
