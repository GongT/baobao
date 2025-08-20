import { globalObject } from '../../platform/globalObject.js';
import type { IDisposable } from '../dispose/disposable.js';
import { DisposableOnce } from '../dispose/sync-disposable.js';
import type { EventHandler } from '../event/type.js';
import { CancellationDriverBrowser } from './driver.browser.js';
import { CancellationDriverCommon } from './driver.common.js';

/** @public */
export interface CancellationToken {
	readonly isCancellationRequested: boolean;
	onCancellationRequested(callback: EventHandler<void>): IDisposable;
}

/** @internal */
export interface __CancellationToken {
	isCancellationRequested: boolean;
	onCancellationRequested(callback: EventHandler<void>): IDisposable;
}

/** @private */
export interface CancellationDriver extends IDisposable {
	readonly token: CancellationToken;
	cancel(): void;
}

/** @public */
export class CancellationTokenSource extends DisposableOnce implements IDisposable {
	private readonly driver: CancellationDriver;
	public readonly token: CancellationToken;

	constructor() {
		super();
		if ('AbortController' in globalObject) {
			this.driver = new CancellationDriverBrowser();
		} else {
			this.driver = new CancellationDriverCommon();
		}
		this.token = this.driver.token;
	}

	cancel(): void {
		this.driver.cancel();
	}

	_dispose(): void {
		this.driver.dispose();
	}
}
