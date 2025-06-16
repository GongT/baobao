import type { IDisposable } from '../dispose/lifecycle.js';
import { Disposable } from '../dispose/lifecycle.sync.js';
import { Emitter } from '../event/event.js';

/**
 * @param unref defaults to `false`, when true, call `unref()` on the timer.
 *            can not set to `true` on other platform.
 * @returns dispose will stop the interval
 */
export function interval(ms: number, action: () => void, unref = false) {
	let timer: number | undefined = setInterval(action, ms);
	// unref is not supported in browser
	if (unref) (timer as any).unref();

	return {
		dispose: () => {
			if (!timer) return;
			clearInterval(timer);
			timer = undefined;
		},
	};
}

/**
 * A simple interval class.
 * 
 * mainly use for pause/resume several times.
 */
export class Interval extends Disposable {
	private readonly _emitter = this._register(new Emitter<void>());
	public readonly onTick = this._emitter.event;
	private timer?: IDisposable;

	constructor(
		private readonly ms: number,
		private readonly unref = false,
	) {
		super();
		this.fire = this.fire.bind(this);
	}

	fire() {
		this._emitter.fire();
	}

	resume() {
		if (this.timer) return;
		this.timer = interval(this.ms, this.fire, this.unref);
	}

	pause() {
		if (!this.timer) return;
		this.timer.dispose();
	}

	override dispose() {
		if (this.timer) this.timer.dispose();
		return super.dispose();
	}
}
