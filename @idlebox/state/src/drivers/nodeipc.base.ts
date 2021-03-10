import { addDisposableEventListener, Disposable } from '@idlebox/common';
import { IRawMessageSend, rawMessageHandler } from '../ipc/errorhandle';
import { IMessage, IMessageHandlerInternal, IPCDriver } from '../ipc/protocol';

import type EventEmitter from 'node:events';

export interface IProcessSlice extends Pick<EventEmitter, 'addListener' | 'removeListener'> {
	send(message: any, callback?: (error: Error | null) => void): boolean;
}

export abstract class NodeIPCBase extends Disposable implements IPCDriver {
	protected handler?: (message: IMessage) => void | Promise<void>;

	constructor(public readonly title: string, protected readonly channel: IProcessSlice) {
		super();
		this._register(addDisposableEventListener(channel, 'message', this.handleMessage.bind(this)));
	}

	protected handleMessage(msg: IRawMessageSend) {
		// console.log('[Driver] {%s} recv - ID:%s', this.title, msg.guid);
		const message = rawMessageHandler.recv(msg);
		if (!message) {
			return;
		}
		// console.log('                   - %s', message.action);

		Promise.resolve()
			.then(() => this.handler!(message))
			.then(
				(data) => {
					this.channel.send(rawMessageHandler.reply(msg, data));
				},
				(e) => {
					this.channel.send(rawMessageHandler.reply(msg, e));
				}
			);
	}

	call<T extends IMessage>(message: T): Promise<any> {
		const [raw, p] = rawMessageHandler.send(message);

		// console.log('[Driver] {%s} call - %j - ID:%s', this.title, message.action, raw.guid);

		this.channel.send(raw, (e) => {
			if (e) {
				console.error('failed send message to child process: %s', e.stack || e.message);
				process.exit(1);
			}
		});

		return p;
	}

	handle(callback: IMessageHandlerInternal): void {
		if (this.handler) {
			throw new Error('duplicate handler');
		}
		this.handler = callback;
	}
}
