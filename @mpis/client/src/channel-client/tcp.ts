import { createConnection, type Socket } from 'node:net';
import { AbstractChannelClient } from './abs.js';
import type { IMessageObject } from '@mpis/shared';
export { make_message, type IMessageObject } from '@mpis/shared';

/**
 * TCP连接的客户端实现
 */
export class TcpClient extends AbstractChannelClient {
	private declare socket: Socket;

	constructor(private readonly remote: string) {
		super();
	}

	protected override async _disconnect() {
		return new Promise<void>((resolve) => {
			this.socket.end(resolve);
		});
	}
	protected override async _connect() {
		let socket: Socket;

		const remote = this.remote.trim();
		if (remote.includes(':')) {
			const [host, port] = remote.split(':');
			socket = createConnection({ port: Number.parseInt(port), host });
		} else {
			socket = createConnection({ path: remote });
		}

		await new Promise<void>((resolve, reject) => {
			socket.once('connect', () => resolve());
			socket.once('error', (err) => reject(err));
		});

		socket.on('error', (err) => {
			this._onFailure.fireNoError(err);
		});

		this.socket = socket;
	}

	protected override _send(message: IMessageObject): void {
		this.socket.write(`${JSON.stringify(message)}\n`);
	}
}
