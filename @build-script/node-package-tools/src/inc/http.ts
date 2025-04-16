import { sleep } from '@idlebox/common';
import { IncomingMessage, OutgoingHttpHeaders } from 'http';
import { get } from 'https';
import { Readable } from 'stream';
import { createBrotliDecompress, createGunzip, createInflate } from 'zlib';
import { debug, errorLog } from './log';
import { getProxyValue } from './proxy';

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

export async function downloadFile(url: string, headers?: OutgoingHttpHeaders): Promise<INormalizedResponse> {
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

				debug(`[http] 重定向到 ${e.location}`);
				url = e.location;
				try_remain++;
				continue;
			}

			errorLog('获取 %s 失败 [剩余尝试次数 %s]', url, try_remain);
			if (try_remain === 0) throw e;

			await sleep(2000);
		}
	}
	throw new Error('不可能的错误');
}

function send_request(url: string, headers: OutgoingHttpHeaders): Promise<any> {
	headers['Accept-Encoding'] = 'br,gzip,deflate';
	return new Promise<any>((resolve, reject) => {
		debug(`[http] 请求 ${url} (代理: ${getProxyValue()})`);

		const request = get(url, { headers }, (response) => {
			debug(`[http] 响应 ${response.statusCode} [encoding: ${response.headers['content-encoding']}]`);
			if (response.statusCode === 200) {
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
				reject(new HttpError(url, response.statusCode!, response.statusMessage!));
			}
		});

		request.on('error', (err) => {
			reject(err);
		});
		request.end();
	});
}
