import { AsyncDisposable } from '@idlebox/common';
import fs, { stat } from 'node:fs/promises';
import { AsyncLock } from './AsyncLock.js';
import type { IMemCachePart } from './MemoryCacheController.js';
import { openCacheFileForRead } from './cacheFileReader.js';
import { type ICacheFileStreamer, openCacheFileForStream } from './cacheFileStreamer.js';
import { type ICacheFileWriter, openCacheFileForWrite } from './cacheFileWriter.js';
import { erasedMark, hexNumber } from './types.js';

/**
 * [bytes] magic1
 * [uint64] metadata size
 * [bytes] metadata json data
 * [bytes] magic1
 *
 * [bytes] magic2
 * [uint64] start value
 * [byte[16]] md5
 * [uint64] section size
 * [bytes] section buffer data
 *
 * [bytes] magic2
 * [uint64] start value
 * [byte[16]] md5
 * [uint64] section size
 * [bytes] section buffer data
 *
 * ..........
 */

export interface ICacheRecv {
	readonly buffers: readonly Uint8Array[];
	readonly start: number;
}

const magic1 = Buffer.from('@section-buffer/v1@', 'utf-8');
const magic2 = Buffer.from('\n---- section ----\n', 'utf-8');

interface ICachePartMeta extends Omit<IMemCachePart, 'buffer'> {
	readonly fileOffset: number;
	readonly hash: Buffer;
}

export class FileStructureError extends Error {
	public override stack: string;

	constructor(
		e: Error,
		public readonly file: string
	) {
		super(`corrupted state file: ${e.message}`);
		this.stack = e.stack ?? e.message;
	}
}

export class FileDataError extends Error {
	public override stack: string;

	constructor(
		e: Error,
		public readonly file: string
	) {
		super(`incomplete state file: ${e.message}`);
		this.stack = e.stack ?? e.message;
	}
}

export class CacheFile extends AsyncDisposable {
	private metadata?: Buffer;
	private sections: ICachePartMeta[] = [];
	private totalSize = 0;

	constructor(protected readonly location: string) {
		super();
	}

	/**
	 *
	 * @throws {FileStructureError} can not continue to process
	 * @throws {FileDataError} some data is invalid, but able to continue
	 */
	@AsyncLock.protect('open')
	async openRead() {
		const reader = await openCacheFileForRead(this.location);
		if (!reader) return;

		this._register(reader, true);

		try {
			await reader.readSignal(magic1);
			const metaSize = await reader.readUint64();
			const metadataBuff = await reader.readBuffer(metaSize);
			await reader.readSignal(magic1);
			// console.error('read meta: ', buff.toString('utf-8'));
			this.metadata = metadataBuff;
		} catch (e: any) {
			await reader.dispose();
			throw new FileStructureError(e, this.location);
		}

		let truncateAt = -1;
		try {
			while (!reader.isEOF()) {
				truncateAt = reader.cursor;
				// console.error('read section: @%s', reader.cursor);
				// console.error('seeking section!!!');
				await reader.readSignal(magic2);
				const startValue = await reader.readUint64();
				const { size, md5, start } = await reader.skipSection();
				// console.error('     seeking: size=%s, start=%s', size, start.toString(16));

				if (md5.equals(erasedMark)) {
					const found = this.sections.findIndex((e) => e.fileOffset === startValue);
					if (found !== -1) {
						this.sections.splice(found, 1);
					} else {
						console.error('missing block want to erase: %s', hexNumber(startValue));
					}
				} else {
					this.sections.push({
						fileOffset: start,
						start: startValue,
						length: size,
						hash: md5,
					});
				}
			}

			truncateAt = -1;
		} catch (e: any) {
			throw new FileDataError(e, this.location);
		} finally {
			await reader.dispose();

			this.totalSize = this.sections.reduce((l, e) => l + e.length, 0);

			if (truncateAt !== -1) {
				// console.error('truncate file to:', shouldTruncate);
				await fs.truncate(this.location, truncateAt).catch((e) => {
					console.error('truncate fail:', e.message);
				});
			}
		}
	}

	isExists() {
		return !!this.metadata;
	}

	get metaJson() {
		if (!this.metadata) return '{}';
		return JSON.parse(this.metadata.toString('utf-8'));
	}

	get parts() {
		return this.sections;
	}

	get dataUsage() {
		return this.totalSize;
	}

	async diskUsage() {
		const ss = await stat(this.location);
		return ss.size;
	}

	private declare _writer?: ICacheFileWriter;

	@AsyncLock.start('write')
	async prepareCreate(metaJson: any) {
		const writer = await openCacheFileForWrite(this.location, true);
		this._register(writer, true);

		this.badSections.length = 0;

		try {
			const buff = Buffer.from(JSON.stringify(metaJson), 'utf-8');
			await writer.writeBuffer(magic1);
			await writer.writeUint64(buff.byteLength);
			await writer.writeBuffer(buff);
			await writer.writeBuffer(magic1);

			this.metadata = buff;
		} catch (e) {
			await writer.dispose();
			throw e;
		}
		this._writer = writer;
	}

	@AsyncLock.start('write')
	async prepareAppend() {
		const writer = await openCacheFileForWrite(this.location, false);
		this._register(writer, true);

		this._writer = writer;
	}

	async closeWriter() {
		if (this._writer) {
			await this.commitBadBlock();
			await this._writer.dispose();
			this._writer = undefined;
			AsyncLock.get(this).release('write');
		}
	}

	@AsyncLock.require('write')
	async writePart(part: ICacheRecv) {
		if (part.buffers.length === 0 || part.start < 0) throw new Error('invalid arguments');
		if (part.buffers.some((e) => e.length === 0)) throw new Error('invalid empty buffer');

		if (!this._writer) throw new Error('not prepared for write');

		await this._writer.writeBuffer(magic2);
		await this._writer.writeUint64(part.start);

		const { dataLength, dataHash, dataStart } = await this._writer.writeSection(...part.buffers);

		this.sections.push({
			fileOffset: dataStart,
			start: part.start,
			length: dataLength,
			hash: dataHash,
		});

		this.totalSize += dataLength;
	}

	async commitBadBlock() {
		if (this.badSections.length === 0) return;

		let shouldClose = false;
		if (!this._writer) {
			// console.log('[bad] open temp writer');
			shouldClose = true;
			await this.prepareAppend();
		} else {
			// console.trace('[bad] not open temp writer', this._writer.guid);
			AsyncLock.get(this).require('write');
		}

		if (!this._writer) throw new Error('not prepared for write');

		const writer = this._writer;
		for (const offset of this.badSections) {
			await writer.writeBuffer(magic2);
			await writer.writeUint64(offset);
			await writer.writeEmpty();
		}
		this.badSections.length = 0;

		if (shouldClose) {
			// console.log('[bad] close temp writer');
			await this.closeWriter();
		}
	}

	async startEmitting() {
		await this.closeWriter();

		AsyncLock.get(this).acquire('emit');

		const reader: ICacheFileStreamer = await openCacheFileForStream(this.location);
		// const helper = new EmitHelper(reader);

		this._register(reader, true);

		reader.onBeforeDispose(() => {
			AsyncLock.get(this).release('emit');
		});

		return reader;
	}

	private readonly badSections: number[] = [];

	markBad(part: ICachePartMeta) {
		const index = this.sections.findIndex((e) => e.fileOffset === part.fileOffset);
		if (index === -1) throw new Error('not found part');
		const [{ length }] = this.sections.splice(index, 1);

		this.totalSize -= length;
		this.badSections.push(part.fileOffset);
	}

	async destroy() {
		await this.dispose();
		await fs.unlink(this.location);
	}
}

export class HashError extends Error {
	constructor(
		public readonly offset: string,
		public readonly want: string,
		public readonly got: string
	) {
		super(`hash mismatch @${offset}\n\twant ${want}\n\tgot  ${got}`);
	}
}
