import { IDisposable } from '../../dispose/lifecycle.js';
import { Emitter, EventHandler } from '../../event/event.js';

import type { CancellationDriver, __CancellationToken } from './source.js';

/** @internal */
export class CancellationDriverCommon implements CancellationDriver {
	private readonly emitter: Emitter<void>;
	public readonly token: __CancellationToken;
	private readonly disposeList: IDisposable[] = [];

	constructor() {
		const emitter = new Emitter<void>();
		this.emitter = emitter;

		const disposeList = this.disposeList;
		const token = {
			isCancellationRequested: false,
			onCancellationRequested(callback: EventHandler<void>) {
				const ret = emitter.handle(callback);
				disposeList.push(ret);
				return ret;
			},
		};
		this.token = token;
	}

	cancel() {
		if (this.token.isCancellationRequested) {
			console.warn('[CancellationTokenSource] is already canceled.');
		} else {
			this.token.isCancellationRequested = true;
			this.emitter.fire();
		}
	}

	dispose() {
		for (const listen of this.disposeList) listen.dispose();
		if (!this.token.isCancellationRequested) {
			this.cancel();
		}
	}
}
