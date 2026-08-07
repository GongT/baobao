import { Emitter, noop } from '@idlebox/common';
import { Writable } from 'node:stream';

/**
 * 原封不动将写入的数据写到后续流中
 *
 * 如果此流没有pipe到任何目标，则write不会回调
 * 直到pipe到目标后，才会开始流动
 *
 * 如果写入失败（例如目标流destroy），则会自动unpipe并发出事件，同时本次写入不会因此失败
 * 此流永远不会通过error事件通知错误，只会在目标写入失败后使用onWriteError事件通知
 */
export class BufferStream extends Writable {
	private readonly _onWriteError = new Emitter<Error>();
	public readonly onWriteError = this._onWriteError.event;
	private destination?: NodeJS.WritableStream;
	private waitingWrite?: {
		chunk: any;
		callback: (error?: Error | null) => void;
	};
	private activeWrite?: {
		destination: NodeJS.WritableStream;
		chunk: any;
		callback: (error?: Error | null) => void;
	};

	constructor() {
		super({ objectMode: true, highWaterMark: 0 });
	}

	override async [Symbol.asyncDispose]() {
		this.destroy();
	}
	async dispose() {
		this.destroy();
	}

	override async _write(chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
		this._writeToDestination(chunk, callback);
	}

	override pipe<T extends NodeJS.WritableStream>(destination: T): T {
		if (this.destination) throw new Error('BufferStream只能pipe到一个目标');
		this.destination = destination;

		destination.on('error', noop);

		const waitingWrite = this.waitingWrite;
		if (waitingWrite) {
			this.waitingWrite = undefined;
			this._writeToDestination(waitingWrite.chunk, waitingWrite.callback);
		}

		return destination;
	}

	unpipe(destination: NodeJS.WritableStream): this {
		if (!this.destination) return this;

		if (this.destination !== destination) {
			throw new Error('BufferStream只能pipe到一个目标');
		}

		this.destination = undefined;

		const activeWrite = this.activeWrite;
		if (activeWrite?.destination === destination) {
			this.activeWrite = undefined;
			this.waitingWrite = activeWrite;
		}

		return this;
	}

	private _writeToDestination(chunk: any, callback: (error?: Error | null) => void) {
		const destination = this.destination;
		if (!destination) {
			this.waitingWrite = { chunk, callback };
			return;
		}

		const activeWrite = { destination, chunk, callback };
		this.activeWrite = activeWrite;
		const finish = (error?: Error | null) => {
			if (this.activeWrite !== activeWrite) return;

			if (error) {
				this._failDestination(destination, error);
				return;
			}
			this.activeWrite = undefined;
			callback();
		};

		try {
			destination.write(chunk, finish);
		} catch (error) {
			if (error instanceof Error) finish(error);
			else finish(new Error(String(error)));
		}
	}

	private _failDestination(destination: NodeJS.WritableStream, error: Error) {
		if (destination !== this.destination) return;

		// destination.off('error', noop);
		this.unpipe(destination);
		this._onWriteError.fire(error);
	}
}
