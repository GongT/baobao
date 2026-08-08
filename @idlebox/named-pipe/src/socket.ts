import { NotImplementedError } from '@idlebox/common';
import { createServer, type Socket } from 'node:net';
import { PassThrough, type Writable } from 'node:stream';
import { NamedPipeBase } from './fn/abs.js';
import { asyncClose, asyncEnd, asyncEndAll } from './fn/promisify.js';

export abstract class NamedSocket extends NamedPipeBase {
	private async listen(reader: PassThrough) {
		const clients: Socket[] = [];
		const s = createServer((conn) => {
			conn.write = () => {
				throw new Error('读取模式不支持write');
			};
			conn.pipe(reader, { end: false });
			conn.on('close', () => {
				conn.unpipe();

				const index = clients.indexOf(conn);
				if (index >= 0) {
					clients.splice(index, 1);
				}
			});
		});

		this.registerInnerObject(clients, asyncEndAll);
		this.registerInnerObject(s, asyncClose);

		await new Promise<void>((resolve, reject) => {
			s.once('error', reject);
			s.listen(this.path, () => {
				resolve();
				s.removeListener('error', reject);
			});
		});
	}

	protected override async _read() {
		const reader = new PassThrough();

		this.registerInnerObject(reader, asyncEnd);

		await this.listen(reader);

		return reader;
	}

	protected override _write(): Promise<Writable> {
		throw new NotImplementedError();
	}
}
