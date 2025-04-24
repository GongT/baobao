import type { EventHandler } from '../../event/event.js';

import type { CancellationDriver, __CancellationToken } from './source.js';

declare const AbortController: any; // TODO
declare type AbortController = any; // TODO

/** @internal */
export class CancellationDriverBrowser implements CancellationDriver {
	private readonly controller: AbortController;
	public readonly token: __CancellationToken;
	private readonly disposeList: (() => void)[] = [];

	constructor() {
		this.controller = new AbortController();

		const signal = this.controller.signal;
		signal.addEventListener('abort', () => {
			token.isCancellationRequested = true;
		});

		const disposeList = this.disposeList;
		const token = {
			isCancellationRequested: false,
			onCancellationRequested(listener: EventHandler<void>) {
				const callback = () => listener();

				signal.addEventListener('abort', callback);

				const dispose = () => signal.removeEventListener('abort', callback);
				disposeList.push(dispose);

				return { dispose };
			},
		};

		this.token = token;
	}

	cancel() {
		if (this.token.isCancellationRequested) {
			console.warn('[CancellationTokenSource] is already canceled.');
		} else {
			this.token.isCancellationRequested = true;
			this.controller.abort();
		}
	}

	dispose() {
		for (const removeListener of this.disposeList) removeListener();
		if (!this.token.isCancellationRequested) {
			this.controller.abort();
		}
	}
}
