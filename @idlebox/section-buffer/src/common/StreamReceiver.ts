import { Writable } from 'stream';

export class StreamReceiver extends Writable {
	constructor(_source: NodeJS.ReadableStream) {
		super({ objectMode: true });
		throw new Error('no impl');
	}
	override _write(
		_chunk: any,
		_encoding: BufferEncoding,
		_callback: (error?: Error | null | undefined) => void
	): void {}
	override _final(_callback: (error?: Error | null | undefined) => void): void {}
}
