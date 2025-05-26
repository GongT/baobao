import type { IMessageObject } from '../types.js';

export abstract class AbstractChannelClient {
	public abstract readonly connected: boolean;
	protected abstract readonly connectPromise: Promise<any>;

	public send(message: IMessageObject) {
		if (this.connected) {
			return this._send(message);
		} else {
			return this.connectPromise.finally(() => this._send(message));
		}
	}

	protected abstract _send(message: IMessageObject): void;
}
