import { Writable } from 'stream';

export class BlackHoleStream extends Writable {
	_write(_chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void {
		callback();
	}
}
