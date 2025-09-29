import type { Socket } from 'socket.io-client';
import { SocketEmitter } from './base.js';

export class SocketIoEmitter extends SocketEmitter {
	constructor(protected readonly socket: Socket) {
		super();
	}

	override send(event: string, ...args: any[]): void {
		this.socket.emit(event, ...args);
	}

	override async send_with_ack(event: string, ...args: any[]): Promise<any> {
		const ack = await this.socket.emitWithAck(event, ...args);

		if (ack.success) return ack;

		const e = new Error(ack.error.message);
		if (ack.error.stack) {
			e.stack = ack.error.stack;
		} else {
			e.stack = e.message;
		}
		throw e;
	}
}
