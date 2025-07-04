import type { Readable, Writable } from 'node:stream';
import type { IDisposable } from '@idlebox/common';

export function disposableStream<T extends Writable | Readable>(stream: T): T & IDisposable {
	if ((stream as any).dispose) {
		return stream as any;
	}

	let closed = false;
	const handleClose = () => {
		closed = true;
	};

	stream.once('close', handleClose);

	return Object.assign(stream, {
		dispose() {
			if (!closed) {
				stream.removeListener('close', handleClose);
				stream.destroy();
			}
		},
	});
}
