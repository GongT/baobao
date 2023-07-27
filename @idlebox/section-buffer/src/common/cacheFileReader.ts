import { Stats } from 'fs';
import fs from 'fs/promises';
import { AsyncDisposable, toDisposable } from '@idlebox/common';
import { hexNumber } from './types';

export async function openCacheFileForRead(file: string): Promise<ICacheFileReader | undefined> {
	let fd: null | fs.FileHandle = null,
		stat: Stats;

	try {
		fd = await fs.open(file, 'r+');
		stat = await fd.stat();
	} catch (e: any) {
		await fd?.close();
		if (e.code === 'ENOENT') {
			return undefined;
		} else {
			throw e;
		}
		// fd = await fs.open(this.location, 'wx');
	}

	if (stat.size === 0) {
		await fd.close();
		return undefined;
	}

	return new CacheFileReader(fd, stat);
}

export interface ICacheFileReader extends CacheFileReader {}

class CacheFileReader extends AsyncDisposable {
	private _cursor = 0;

	constructor(
		private readonly fd: fs.FileHandle,
		private readonly stat: Stats
	) {
		super();
		this._register(
			toDisposable(() => {
				fd.close();
			})
		);
		if (!stat.isFile()) {
			throw new Error('not a regular file');
		}
	}

	get cursor() {
		return this._cursor;
	}

	seekPass(length: number) {
		this._cursor += length;
	}

	private async read(output: NodeJS.ArrayBufferView) {
		if (!output.byteLength) {
			throw new Error(`zero length buffer reading at ${hexNumber(this.cursor)}`);
		}
		const result = await this.fd.read(output, 0, output.byteLength, this._cursor);
		// console.error('read: cursor=%s, want=%s, read=%s', this._cursor, output.byteLength, result.bytesRead);
		this._cursor += result.bytesRead;
		if (result.bytesRead !== output.byteLength) {
			throw new Error(
				`unexpected ending of file: reading ${result.bytesRead} bytes, expect ${output.byteLength}`
			);
		}
	}

	seek(pos: number) {
		if (pos < 0 || pos > this.stat.size) throw new Error(`seek out of range: ${pos} !~ [0, ${this.stat.size}]`);

		this._cursor = pos;
	}

	async skipSection() {
		const md5 = await this.readBuffer(16);
		const size = await this.readUint64();
		const start = this._cursor;
		this.seekPass(size);
		return { md5, size, start };
	}

	private sizeBuf = new BigUint64Array(1);
	async readUint64() {
		this.sizeBuf[0] = -1n;

		await this.read(Buffer.from(this.sizeBuf.buffer));

		const v = this.sizeBuf[0];
		if (v > Number.MAX_SAFE_INTEGER) throw new Error(`size ${v} is too large`);

		return Number(v);
	}

	isEOF() {
		// console.error('isEOF: %s | %s', this._cursor, this.stat.size);
		if (this.hasDisposed) return true;

		if (this._cursor === this.stat.size) {
			return true;
		} else if (this._cursor > this.stat.size) {
			throw new Error('read cursor overflow');
		} else {
			return false;
		}
	}

	async readBuffer(length: number) {
		const buff = Buffer.allocUnsafe(length);
		await this.read(buff);
		return buff;
	}

	async readSignal(signal: Buffer) {
		const buff = await this.readBuffer(signal.byteLength);

		if (!buff.equals(signal)) {
			throw new SignatureError(`unexpect bytes ${buff.toString('hex')}, expect ${signal.toString('hex')}`);
		}
	}
}

export class SignatureError extends Error {}
