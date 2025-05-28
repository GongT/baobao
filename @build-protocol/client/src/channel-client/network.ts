import { createConnection, type Socket } from 'node:net';
import type { IMessageObject } from '../types.js';
import { AbstractChannelClient } from './abs.js';

function connect(remote: string) {
	let socket: Socket;
	if (remote.includes(':')) {
		const [host, port] = remote.split(':');
		socket = createConnection({ port: Number.parseInt(port), host });
	} else {
		socket = createConnection({ path: remote });
	}

	return new Promise<Socket>((resolve, reject) => {
		socket.on('connect', () => resolve(socket));
		socket.on('error', (err) => reject(err));
	});
}

export class NetworkClient extends AbstractChannelClient {
	protected override connectPromise: Promise<any>;
	private declare socket: Socket;

	constructor(remote: string) {
		super();
		this.connectPromise = connect(remote).then((socket) => {
			this.socket = socket;
		});
	}

	public get connected(): boolean {
		return !!this.socket;
	}

	protected override _send(message: IMessageObject): void {
		this.socket.write(`${JSON.stringify(message)}\n`);
	}
}
