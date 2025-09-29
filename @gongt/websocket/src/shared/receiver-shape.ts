import type { IDisposable } from '@idlebox/common';
import { walkPrototypeTree } from '../common/walk-prototype-tree.js';
import type { IRemoteInfo, SocketEmitter } from './emitter/base.js';
import type { WebsocketSender } from './sender-shape.js';

export abstract class WebsocketReceiver {
	constructor(protected remote: SocketEmitter) {
		for (const item of walkPrototypeTree(this.constructor, WebsocketReceiver)) {
			console.log(item);
		}
	}

	protected on(event: string, listener: Function, metadata: IRemoteInfo): IDisposable {
		return {
			event,
			listener,
			metadata,
			dispose() {},
		} as any;
	}
}

export abstract class WebsocketServer extends WebsocketReceiver {
	protected abstract readonly pushEvents: WebsocketSender;
	protected abstract getContext(): Promise<any> | any;
}
