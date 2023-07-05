import { Writable } from 'stream';

export class BlackHoleStream extends Writable {
	override _write(_chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void {
		callback();
	}
}
