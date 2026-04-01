import { Writable } from 'node:stream';
import { streamPromise } from './streamPromise.js';

export function streamToBuffer(stream: NodeJS.ReadableStream, raw: false): Promise<string>;
export function streamToBuffer(stream: NodeJS.ReadableStream, raw: true): Promise<Buffer>;
export function streamToBuffer(stream: NodeJS.ReadableStream, raw: boolean): Promise<string | Buffer> {
	if (raw) {
		return new RawCollectingStream(stream).promise();
	}
	return new CollectingStream(stream).promise();
}

export class RawCollectingStream extends Writable {
	private buffer: Buffer = Buffer.allocUnsafe(0);
	private _promise?: Promise<Buffer>;

	constructor(sourceStream?: NodeJS.ReadableStream) {
		super();
		if (sourceStream) {
			sourceStream.pipe(this);
			sourceStream.on('error', (e) => {
				this.emit('error', e);
			});
		}
	}

	override _write(chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void {
		this.buffer = Buffer.concat([this.buffer, chunk]);
		callback();
	}

	getOutput(): Buffer {
		return this.buffer;
	}

	clear() {
		this.buffer = Buffer.allocUnsafe(0);
	}

	promise(): Promise<Buffer> {
		if (!this._promise) {
			this._promise = streamPromise(this).then(() => {
				const buffer = this.buffer;
				this.buffer = Buffer.allocUnsafe(0);
				return buffer;
			});
		}
		return this._promise;
	}
}

export class CollectingStream extends Writable {
	private buffer = '';
	private _promise?: Promise<string>;

	constructor(sourceStream?: NodeJS.ReadableStream) {
		super({ objectMode: true }); // object is string
		if (sourceStream) {
			sourceStream.pipe(this);
			sourceStream.on('error', (e) => {
				this.emit('error', e);
			});
		}
	}

	/**
	 * chunk其实是string
	 */
	override _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
		this.buffer += chunk.toString(encoding);
		callback();
	}

	clear() {
		this.buffer = '';
	}

	getOutput() {
		return this.buffer;
	}

	promise(): Promise<string> {
		if (!this._promise) {
			this._promise = streamPromise(this).then(() => {
				const buffer = this.buffer;
				this.buffer = '';
				return buffer;
			});
		}
		return this._promise;
	}
}
