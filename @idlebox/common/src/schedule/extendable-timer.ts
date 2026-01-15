import { DeferredPromise } from '../promise/deferred-promise.js';
import type { TimeoutType } from './local-type.js';

/**
 * 反复推迟的 setTimeout
 */
export class ExtendableTimer {
	private readonly dfd = new DeferredPromise<void>();
	private tmr?: TimeoutType;

	constructor(private readonly durationMs: number) {}

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
		}
	}

	get p(): Promise<void> {
		return this.dfd.p;
	}

	get onSchedule() {
		const p = this.dfd.p;
		return p.then.bind(p);
	}
}
