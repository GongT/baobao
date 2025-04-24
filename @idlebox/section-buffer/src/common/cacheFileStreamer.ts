import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { Transform, type TransformCallback } from 'node:stream';
import { AsyncDisposable, toDisposable } from '@idlebox/common';

export async function openCacheFileForStream(file: string): Promise<ICacheFileStreamer> {
	const fd = await fs.open(file, 'r');

	return new CacheFileStreamer(fd);
}

export interface ICacheFileStreamer extends CacheFileStreamer {}

class CacheFileStreamer extends AsyncDisposable {
	constructor(private readonly fd: fs.FileHandle) {
		super();
		this._register(
			toDisposable(() => {
				fd.close();
			})
		);
	}

	stream(start: number, length: number) {
		// console.log('readSection: size=%s, start=%s', size, start);

		return this.fd.createReadStream({
			autoClose: false,
			emitClose: true,
			end: start + length - 1,
			start: start,
		});
	}
}

export class Md5Hasher extends Transform {
	private md5?: Buffer;
	private readonly hasher = createHash('md5');

	override _transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
		// console.log('read chunk: (%s)', chunk.byteLength, chunk);
		this.hasher.update(chunk);
		callback(null, chunk);
	}
	override _final(callback: TransformCallback) {
		this.md5 = this.hasher.digest();
		/*if (Buffer.compare(realMd5, md5) !== 0) {
			callback(new HashError(hexNumber(start), md5.toString('hex'), realMd5.toString('hex')));
		}*/
		callback();
	}

	getHash() {
		if (!this.md5) {
			throw new Error('stream hash is not prepared');
		}
		return this.md5;
	}

	sameWith(wantMd5: Buffer) {
		if (!this.md5) {
			throw new Error('stream hash is not prepared');
		}
		return this.md5.equals(wantMd5);
	}
}
