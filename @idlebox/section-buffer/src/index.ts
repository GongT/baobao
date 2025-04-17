import { AsyncDisposable, MemorizedEmitter, toDisposable } from '@idlebox/common';
import { open, rename } from 'fs/promises';
import { basename, dirname } from 'path';
import { pipeline } from 'stream/promises';
import { AsyncLock } from './common/AsyncLock.js';
import { LossyAsyncQueue } from './common/AsyncQueue.js';
import { CacheFile } from './common/CacheFile.js';
import { MemoryCacheController } from './common/MemoryCacheController.js';
import { StreamReceiver } from './common/StreamReceiver.js';
import { Md5Hasher } from './common/cacheFileStreamer.js';
import { makeEmptyFile } from './common/makeEmptyFile.js';
import { ISectionData } from './common/types.js';

interface ILive {
	readonly start: number;
	readonly receiver: StreamReceiver;
}

export interface ISectionBufferOptions<MetaType> {
	readonly cacheFile: string;
	readonly targetFile: string;
	readonly fileSize: number;
	readonly metadata: MetaType;
	readonly syncInterval?: number;
	readonly syncSize?: number;
}

export const defaults = {
	syncSize: 500 * 1024 * 1024,
	syncInterval: 500 * 1024 * 1024,
};

enum TriggerKind {
	manual,
	timer,
	dataRecv,
	sync,
}

export async function createSectionBuffer<MetaType>(options: ISectionBufferOptions<MetaType>) {
	const instance = new SectionBuffer(options);
	await instance.start();
	return instance;
}

export class SectionBuffer<MetaType> extends AsyncDisposable {
	public readonly onBusy;
	public readonly onError;

	private readonly _onComplete = new MemorizedEmitter<boolean>();
	public readonly onComplete = this._onComplete.register;

	protected readonly options: Required<ISectionBufferOptions<MetaType>>;

	protected readonly mem;
	protected readonly file;
	protected readonly queue;
	protected readonly receivers: ILive[] = [];
	protected _timer?: NodeJS.Timeout;
	protected _complete = false;
	protected _isManual = false;

	constructor(options: ISectionBufferOptions<MetaType>) {
		super();

		this.options = { ...defaults, ...options };

		this.mem = new MemoryCacheController(this.options.fileSize);
		this.file = this._register(new CacheFile(this.options.cacheFile), true);
		this.queue = this._register(new LossyAsyncQueue<TriggerKind>((kind) => this.trigger(kind)));
		this.onBusy = this.queue.onBusy;
		this.onError = this.queue.onError;
	}

	get isCompleted() {
		return this._complete;
	}

	@AsyncLock.protect('starting')
	async start(): Promise<boolean | undefined> {
		if (this._timer || this._complete || this._rebuilding || this.hasDisposed) throw new Error('already started');

		await this.file.openRead();
		const isExists = this.file.isExists();
		if (isExists) {
			await this.file.prepareAppend();

			for (const part of this.file.parts) {
				this.mem.push(part);
			}
			this.mem.check();
		} else {
			await this.file.prepareCreate(this.options.metadata);
		}

		if (this.mem.isFullfilled()) {
			await this.__rebuildFinalFile(); // will complete
		} else {
			this._timer = setInterval(() => {
				if (!this._isManual) this.queue.pushQueue(TriggerKind.timer);
			}, this.options.syncInterval ?? defaults.syncInterval);
			this._register(toDisposable(() => this.killTimer()));
		}
		return isExists;
	}

	private killTimer() {
		if (this._timer) {
			clearInterval(this._timer);
			delete this._timer;
		}
	}

	get progress() {
		return {
			fullfilled: this.mem.size,
			view: this.mem.viewState,
			total: this.options.fileSize,
		};
	}

	push(section: ISectionData) {
		if (this._complete || this._rebuilding || this.hasDisposed) throw new Error('invalid state');
		if (Buffer.isBuffer(section.buffer)) {
			// console.log('new data recv %s at %s', humanSize(section.buffer.byteLength), hexNumber(section.start));
			this.mem.push({
				start: section.start,
				buffer: section.buffer,
				length: section.buffer.length,
			});

			if (!this._isManual) this.queue.pushQueue(TriggerKind.dataRecv);
		} else {
			this.receivers.push({
				start: section.start,
				receiver: new StreamReceiver(section.buffer),
			});
		}
	}

	override async dispose(): Promise<void> {
		await this.sync();
		await super.dispose();
	}

	async sync() {
		if (this._complete) return;

		this.queue.lock(true);
		await this.queue.promise;
		if (!this._complete) await this.trigger(TriggerKind.sync);
		this.queue.lock(false);
	}

	@AsyncLock.protect('sync', true)
	private async trigger(kind: TriggerKind) {
		this._isManual = false;
		// console.log('trigger: kind=%s, full=%s', TriggerKind[kind], this.mem.isFullfilled());

		if (this._complete || this.hasDisposed) throw new Error('invalid state');

		if (this.mem.isFullfilled()) {
			await this.__rebuildFinalFile();
			return;
		}

		if (kind === TriggerKind.dataRecv) {
			await this.__flushCache(false);
		} else if (kind === TriggerKind.manual || kind === TriggerKind.sync) {
			await this.__flushCache(true);
		} else if (kind === TriggerKind.timer) {
			if (Date.now() - this.lastFlush > this.options.syncInterval) {
				await this.__flushCache(true);
			}
		} else {
			throw new Error('invalid program state');
		}
	}

	private lastFlush: number = 0;

	forceSync() {
		this._isManual = true;
		this.queue.pushQueue(TriggerKind.manual);
	}

	private __flushCache(force: boolean) {
		if (!force && this.mem.memoryUsage < this.options.syncSize) {
			// console.log('flush cache file: skip.');
			return Promise.resolve();
		}

		// console.log(
		// 	'flush cache file! (force=%s, memuse=%s >= %s)',
		// 	force,
		// 	this.mem.memoryUsage(),
		// 	this.options.syncSize
		// );
		return this.__flushCacheReal();
	}
	private async __flushCacheReal() {
		this.lastFlush = Date.now();
		let numberWrites = 0,
			bytesWrite = 0;
		while (true) {
			const chunk = this.mem.shift();
			if (!chunk) break;

			// console.log('\tchunk at %s, %s bytes', hexNumber(chunk.start), chunk.totalSize);
			await this.file.writePart(chunk);
			numberWrites++;
			bytesWrite += chunk.totalSize;
		}
		// console.log('flush cache finish (%s writes, %s bytes).', numberWrites, bytesWrite);
	}

	private _rebuilding = false;
	private async __rebuildFinalFile() {
		this._rebuilding = true;

		const target = dirname(this.options.targetFile) + '/.' + basename(this.options.targetFile);
		let hasError = false;

		// console.log('rebuild output file! (to %s)', target);

		await makeEmptyFile(target, this.options.fileSize);
		// console.log('    empty file created: %s bytes', this.options.fileSize);

		const fd = await open(target, 'r+');

		// console.log('memory: [%s]', humanSize(this.mem.memoryUsage()), this.mem.viewState());
		// const { data: dataSaved, usage: diskUsage } = this.file.calcSize();
		// console.log(
		// 	'file  : [%s data + %s meta]',
		// 	humanSize(dataSaved),
		// 	humanSize(diskUsage - dataSaved),
		// 	this.file.parts
		// );

		const emitter = await this.file.startEmitting();
		try {
			while (true) {
				const chunk = this.mem.shift();
				if (!chunk) break;

				// console.log('[memory] write file: [%s] %s bytes', hexNumber(chunk.start), chunk.totalSize);

				/** TODO: const result =*/
				await fd.writev(chunk.buffers, chunk.start);

				// console.log('[memory] write complete: %s bytes', result.bytesWritten);
			}

			for (const part of this.file.parts) {
				const output = fd.createWriteStream({ autoClose: false, start: part.start });
				const input = emitter.stream(part.fileOffset, part.length);

				// console.log(
				// 	'[cache] write file: [%s -> %s] %s bytes',
				// 	hexNumber(part.fileOffset),
				// 	hexNumber(part.start),
				// 	part.length
				// );

				const hash = new Md5Hasher();
				await pipeline(input, hash, output);

				// console.log('write complete: %s bytes', output.bytesWritten);

				if (!hash.sameWith(part.hash)) {
					const md5 = hash.getHash();
					console.error('          hash:  %s', md5.toString('hex'));
					console.error('          want:  %s', part.hash.toString('hex'));
					this.file.markBad(part);
					this.mem.punchHole(part);
					hasError = true;
				}
			}

			if (hasError) {
				return;
			}

			await rename(target, this.options.targetFile);
			await this.file.destroy();
			Object.assign(this, { file: null });

			this._complete = true;
			this.killTimer();

			this._onComplete.fire(true);
		} finally {
			this._rebuilding = false;
			await emitter.dispose();
		}
	}
}
