/// <reference lib="dom" />

import { addDisposableEventListener, Disposable } from '@idlebox/common';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { rawMessageHandler } from '../ipc/errorhandle';
import { IMessage, IMessageHandlerInternal, IPCServerDriver } from '../ipc/protocol';

function isValidRender() {
	if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
		return true;
	} else {
		return false;
	}
}

export class ElectronIPCRender extends Disposable implements IPCServerDriver {
	protected handlerHasRegister = false;
	public readonly title = document.title;

	constructor(private readonly channel: string) {
		if (!isValidRender()) {
			throw new Error('not valid electron renderer process environment');
		}
		super();
	}

	call<T extends IMessage>(message: T): Promise<any> {
		return ipcRenderer.invoke(this.channel, message);
	}

	handle(callback: IMessageHandlerInternal): void {
		if (this.handlerHasRegister) {
			throw new Error('duplicate handler');
		}
		this.handlerHasRegister = true;
		const channel = this.channel;

		this._register(
			addDisposableEventListener(
				ipcRenderer,
				channel,
				function messageHandler(event: IpcRendererEvent, msg: any) {
					const message = rawMessageHandler.recv(msg);
					if (!message) {
						return;
					}

					Promise.resolve()
						.then(() => callback(message))
						.then(
							(data) => {
								event.sender.send(channel, rawMessageHandler.reply(msg, data));
							},
							(e) => {
								event.sender.send(channel, rawMessageHandler.reply(msg, e));
							}
						);
				}
			)
		);
	}
}
