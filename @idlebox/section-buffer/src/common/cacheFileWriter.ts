import { createHash } from 'crypto';
import { WriteStream } from 'fs';
import fs from 'fs/promises';
import { AsyncDisposable, toDisposable } from '@idlebox/common';
import { erasedMark } from './types';

export async function openCacheFileForWrite(file: string, create: boolean): Promise<CacheFileWriter> {
	const fd = await fs.open(file, create ? 'ax' : 'a');

	const stat = await fd.stat().catch(async (e) => {
		await fd.close();
		throw e;
	});
	if (!create && stat.size === 0) {
		await fd.close();
		await fs.rm(file);
		throw Object.assign(new Error(`ENOENT: no such file or directory, open '${file}'`), {
			code: 'ENOENT',
			errno: -2,
			path: file,
			syscall: 'open',
		});
	}

	return new CacheFileWriter(fd, stat.size);
}

export interface ICacheFileWriter extends CacheFileWriter {}
type Writable = Buffer | Uint8Array;

// let guid = 1;

class CacheFileWriter extends AsyncDisposable {
	private readonly stream: WriteStream;
	// public readonly guid: number;

	constructor(
		fd: fs.FileHandle,
		private cursor: number
	) {
		super();

		// this.guid = guid++;
		this.stream = fd.createWriteStream();
		this._register(
			toDisposable(async () => {
				// console.trace('writer dispose:', this.guid);
				await new Promise((resolve) => {
					this.stream.end(resolve);
				});
			})
		);
	}

	getPosition() {
		return this.cursor;
	}

	async writeEmpty() {
		await this.writeBuffer(erasedMark);
		await this.writeUint64(0);
	}

	async writeSection(...buffs: readonly Writable[]) {
		let totalSize = 0;
		const hasher = createHash('md5');
		for (const buff of buffs) {
			totalSize += buff.byteLength;
			hasher.update(buff);
		}
		const md5 = hasher.digest();

		await this.writeBuffer(md5);
		await this.writeUint64(totalSize);

		const start = this.cursor;
		const ret = await this.writeBuffer(...buffs);
		if (ret.bytesWritten !== totalSize) {
			throw new Error(`write file failed: written ${ret.bytesWritten} bytes, want ${totalSize} bytes`);
		}
		return { dataLength: totalSize, dataStart: start, dataHash: md5 };
	}

	async writeUint64(v: number) {
		const sizeBuf = new BigUint64Array([BigInt(v)]);
		return await this.writeBuffer(Buffer.from(sizeBuf.buffer));
	}

	async writeBuffer(...buffs: readonly Writable[]) {
		let bytesWritten = 0;
		for (const buff of buffs) {
			await write(this.stream, buff);
			bytesWritten += buff.byteLength;
		}
		this.cursor += bytesWritten;
		return { bytesWritten };
	}
}

function write(stream: NodeJS.WritableStream, data: Writable) {
	return new Promise<void>((resolve, reject) => {
		if (stream.write(data)) {
			process.nextTick(resolve);
		} else {
			stream.once('drain', () => {
				stream.off('error', reject);
				resolve();
			});
			stream.once('error', reject);
		}
	});
}
