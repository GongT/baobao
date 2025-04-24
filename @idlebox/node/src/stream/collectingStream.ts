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
	private buffer?: Buffer = Buffer.allocUnsafe(0);
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
		this.buffer = Buffer.concat([this.buffer!, chunk]);
		callback();
	}

	getOutput(): Buffer {
		return this.buffer!;
	}

	promise(): Promise<Buffer> {
		return this._promise
			? this._promise
			: (this._promise = streamPromise(this).then(() => {
					const buffer = this.buffer!;
					this.buffer = undefined;
					return buffer;
				}));
	}
}

export class CollectingStream extends Writable {
	private buffer? = '';
	private _promise?: Promise<string>;

	constructor(sourceStream?: NodeJS.ReadableStream) {
		super();
		if (sourceStream) {
			sourceStream.pipe(this);
			sourceStream.on('error', (e) => {
				this.emit('error', e);
			});
		}
	}

	override _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
		if (!encoding) {
			encoding = 'utf8';
		} else if ((encoding as any) === 'buffer' || encoding === 'binary') {
			encoding = 'utf8';
		}
		this.buffer += chunk.toString(encoding);
		callback();
	}

	getOutput() {
		return this.buffer!;
	}

	promise(): Promise<string> {
		return this._promise
			? this._promise
			: (this._promise = streamPromise(this).then(() => {
					const buffer = this.buffer!;
					this.buffer = undefined;
					return buffer;
				}));
	}
}
