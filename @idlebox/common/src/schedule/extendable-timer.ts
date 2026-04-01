import { CanceledError } from '@idlebox/errors';
import type { IDisposable } from '../lifecycle/dispose/disposable.js';
import { DeferredPromise } from '../promise/deferred-promise.js';

/**
 * 反复推迟的 setTimeout
 */
export class ExtendableTimer implements IDisposable {
	private readonly dfd = new DeferredPromise<void>();
	private tmr?: ITimeoutType;

	constructor(private readonly durationMs: number) {
		this.dispose = this.cancel;
	}

	start() {
		if (this.tmr) {
			this.renew();
		} else {
			this._set();
		}
	}

	renew() {
		if (!this.tmr) return;

		clearTimeout(this.tmr);
		this._set();
	}

	private _set() {
		this.tmr = setTimeout(() => {
			this.dfd.complete();
		}, this.durationMs);
	}

	cancel() {
		if (this.tmr) {
			clearTimeout(this.tmr);
			this.tmr = undefined;
			this.dfd.error(new CanceledError({ boundary: this.cancel }));
		}
	}

	get p(): Promise<void> {
		return this.dfd.p;
	}

	get onSchedule() {
		const p = this.dfd.p;
		return p.then.bind(p);
	}

	public readonly dispose;
}
