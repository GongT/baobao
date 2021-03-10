import { createSymbol, Disposable, globalSingletonDelete, globalSingletonStrong } from '@idlebox/common';
import { IMessage, IMessageHandlerInternal, IPCDriver, IPCServerDriver } from '../ipc/protocol';

export function createSameProcessMain(title: string) {
	return globalSingletonStrong(createSymbol('idlebox/state', title), () => {
		return new SameProcessMain(title);
	});
}
export function createSameProcessChild(title: string) {
	return globalSingletonStrong(createSymbol('idlebox/state', title), () => {
		return new SameProcessMain(title);
	}).fork();
}

export class SameProcessMain extends Disposable implements IPCServerDriver {
	protected mHandler?: IMessageHandlerInternal;
	protected cHandler?: IMessageHandlerInternal;

	constructor(public readonly title: string) {
		super();
	}

	call<T extends IMessage>(message: T): Promise<any> {
		console.log('call cHandler', this.title);
		return this.cHandler!(message);
	}
	handle(callback: IMessageHandlerInternal): void {
		if (this.mHandler) {
			throw new Error('duplicate handler');
		}
		console.log('set mHandler', this.title);
		this.mHandler = callback;
	}
	dispose(): void {
		globalSingletonDelete(createSymbol('idlebox/state', this.title));
	}

	fork(): IPCDriver {
		return {
			dispose() {},
			call: (message: IMessage) => {
				console.log('call mHandler', this.title);
				return this.mHandler!(message);
			},
			handle: (callback: IMessageHandlerInternal) => {
				if (this.cHandler) {
					throw new Error('duplicate handler');
				}
				console.log('set cHandler', this.title);
				this.cHandler = callback;
			},
		};
	}
}
