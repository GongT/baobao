import { IncomingMessage, OutgoingHttpHeaders } from 'http';
import { get } from 'https';
import { Readable } from 'stream';
import { createBrotliDecompress, createGunzip, createInflate } from 'zlib';
import { DeferredPromise } from '@idlebox/common';

export class HttpError extends Error {
	constructor(public readonly code: number, msg: string) {
		super(`Server responded with ${code}: ${msg}`);
	}

	static is(obj: any): obj is HttpError {
		return obj instanceof HttpError;
	}
}

type IStream = { stream: Readable };
export type INormalizedResponse = Omit<IncomingMessage, keyof Readable> & IStream;

export function downloadFile(url: string, headers?: OutgoingHttpHeaders): Promise<INormalizedResponse> {
	const dfd = new DeferredPromise<IncomingMessage & IStream>();
	_downloadFile(dfd, url, headers || {});
	return dfd.p;
}

function _downloadFile(dfd: DeferredPromise<IncomingMessage & IStream>, url: string, headers: OutgoingHttpHeaders) {
	headers['Accept-Encoding'] = 'br,gzip,deflate';

	const request = get(url, { headers }, (response) => {
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
			dfd.complete(Object.assign(response, { stream }));
		} else if (
			(response.statusCode === 302 ||
				response.statusCode === 301 ||
				response.statusCode === 303 ||
				response.statusCode === 307 ||
				response.statusCode === 308) &&
			response.headers.location
		) {
			_downloadFile(dfd, response.headers.location, headers);
		} else {
			dfd.error(new HttpError(response.statusCode!, response.statusMessage!));
		}
	});

	request.on('error', (err) => {
		dfd.error(err);
	});
	request.end();
}
