import { createServer, type Socket } from 'node:net';
import { join } from 'node:path';
import { PassThrough, type Writable } from 'node:stream';
import { NamedPipeBase, type IOptions } from './fn/abs.js';
import { asyncClose, asyncEnd } from './fn/promisify.js';

export class NamedPipeWin32 extends NamedPipeBase {
	constructor(path: string, options: IOptions = {}) {
		if (path.startsWith('/') || path.startsWith('\\')) {
			path = join('//./pipe', path);
		} else {
			throw new Error(`仅允许绝对路径 (需以/开头): ${path}`);
		}

		super(path, options);
	}

	protected override async _create() {
		// windows命名管道不用创建
	}

	protected override async _read() {
		const reader = new PassThrough();
		let client: Socket | undefined;
		const s = createServer((conn) => {
			if (client && !client.closed) {
				conn.destroy();
				return;
			}

			client = conn;
			conn.pipe(reader, { end: false });
			conn.on('close', () => {
				if (client === conn) {
					client = undefined;
				}
			});
		});

		this.registerInner(async () => {
			const ps = [];
			if (client) {
				ps.push(asyncEnd(client));
			}
			ps.push(asyncClose(s));

			await Promise.all(ps);

			await asyncEnd(reader);
		});

		await new Promise<void>((resolve, reject) => {
			s.once('error', reject);
			s.listen(this.path, () => {
				resolve();
				s.removeListener('error', reject);
			});
		});

		return reader;
	}

	protected override _write(): Promise<Writable> {
		throw new Error('Method not implemented.');
	}
	protected override _close(_graceful: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
