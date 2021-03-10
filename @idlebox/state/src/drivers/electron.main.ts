/// <reference lib="dom" />

import { Disposable, toDisposable } from '@idlebox/common';
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { rawMessageHandler } from '../ipc/errorhandle';
import { IMessage, IMessageHandlerInternal, IPCServerDriver } from '../ipc/protocol';

function isValidMain() {
	if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
		return true;
	} else {
		return false;
	}
}

export class ElectronIPCMain extends Disposable implements IPCServerDriver {
	protected handlerHasRegister = false;
	private static duplicateCheck = new Set<string>();

	constructor(private readonly channel: string, private readonly browserWindow: BrowserWindow) {
		if (!isValidMain()) {
			throw new Error('not valid electron main process environment');
		}
		super();

		if (ElectronIPCMain.duplicateCheck.has(channel)) {
			throw new Error('duplicate use of channel ' + channel);
		}

		ElectronIPCMain.duplicateCheck.add(channel);

		this._register(
			toDisposable(() => {
				ElectronIPCMain.duplicateCheck.delete(channel);
				ipcMain.removeHandler(channel);
			})
		);
	}

	get title() {
		return this.browserWindow.title;
	}

	call<T extends IMessage>(message: T): Promise<any> {
		const [raw, p] = rawMessageHandler.send(message);

		// console.log('[Driver] {%s} call - %j - ID:%s', this.title, message.action, raw.guid);

		this.browserWindow.webContents.send(this.channel, raw);

		return p;
	}

	handle(callback: IMessageHandlerInternal): void {
		if (this.handlerHasRegister) {
			throw new Error('duplicate handler');
		}
		this.handlerHasRegister = true;

		ipcMain.handle(this.channel, function eventMessageHandler(_event: IpcMainInvokeEvent, data: any) {
			return callback(data);
		});
	}
}
