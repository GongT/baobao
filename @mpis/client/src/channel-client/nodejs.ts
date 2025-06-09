import type { IMessageObject } from '@mpis/shared';
import { AbstractChannelClient } from './abs.js';

export class NodejsIpcClient extends AbstractChannelClient {
	constructor() {
		super();

		if (typeof process.send !== 'function') {
			throw new Error('process.send is not a function, this is not a valid child process');
		}
	}

	protected override async _disconnect(): Promise<void> {}
	protected override async _connect(): Promise<void> {}

	protected override _send(message: IMessageObject): void {
		// biome-ignore lint/style/noNonNullAssertion: checked in constructor
		process.send!(message);
	}
}
