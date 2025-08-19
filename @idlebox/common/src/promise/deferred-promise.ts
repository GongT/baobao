import { CanceledError, TimeoutError } from '@idlebox/errors';
import type { TimeoutType } from '../autoindex.js';
import type { IDisposable } from '../lifecycle/dispose/disposable.js';
import { scheduler } from '../schedule/scheduler.js';

export type ValueCallback<T = any> = (value: T | Promise<T>) => void;
export type ProgressCallback<T = any> = (value: T) => void;

export interface IProgressHolder<T, PT> {
	progress(fn: ProgressCallback<PT>): Promise<T> & IProgressHolder<T, PT>;
}

/**
 * a promise can resolve or reject later
 * @public
 */
export class DeferredPromise<T, PT = any> {
	readonly promise: Promise<T> & IProgressHolder<T, PT>;
	#completeCallback: ValueCallback<T>;
	#errorCallback: (err: any) => void;
	#success?: boolean;
	#progressList: ProgressCallback<PT>[] = [];

	constructor() {
		const { promise, resolve, reject } = Promise.withResolvers<T>();
		this.#completeCallback = resolve;
		this.#errorCallback = reject;

		this.promise = Object.assign(promise, {
			progress: (fn: ProgressCallback<PT>) => {
				this.progress(fn);
				return this.p;
			},
		});
	}

	get p() {
		return this.promise;
	}

	/**
	 * notify progress to callbacks
	 * @param progress argument
	 * @returns
	 */
	notify(progress: PT): this {
		if (this.#success !== undefined) throw new Error('no more event after settled');
		for (const cb of this.#progressList) {
			scheduler(cb.bind(undefined, progress));
		}
		return this;
	}

	/**
	 * register a progress callback
	 * @param fn progress callback function, will be called when notify is called
	 */
	protected progress(fn: ProgressCallback<PT>): IDisposable {
		if (this.#success !== undefined) throw new Error('no more listener after settled');
		this.#progressList.push(fn);

		const dispose = () => {
			const index = this.#progressList.indexOf(fn);
			if (index >= 0) {
				this.#progressList.splice(index, 1);
			}
		};
		return {
			dispose,
		};
	}

	/**
	 * whether the promise is still working (not completed)
	 */
	get working(): boolean {
		return this.#success === undefined;
	}

	/**
	 * @deprecated use settled
	 */
	get completed() {
		return this.settled;
	}

	/**
	 * whether the promise is settled (resolved or rejected)
	 */
	get settled(): boolean {
		return this.#success !== undefined;
	}

	get resolved(): boolean {
		return this.#success === true;
	}

	get rejected(): boolean {
		return this.#success === false;
	}

	/**
	 * resolve the promise
	 */
	complete(value: T) {
		if (this.settled) return;
		this.#success = true;
		this.#after_settled();
		this.#completeCallback(value);
	}

	/**
	 * reject the promise
	 */
	error(err: any) {
		if (this.settled) return;
		this.#success = false;
		this.#after_settled();
		this.#errorCallback(err);
	}

	/**
	 * reject the deferred with {CancelError}
	 */
	cancel() {
		this.error(new CanceledError());
	}

	#after_settled() {
		this.#progressList.length = 0;
		this.#cancel_timeout();
	}

	get callback() {
		if (this.#success !== undefined) throw new Error('can not generate callback after settled');

		return (error?: null | undefined | Error, data?: T) => {
			if (error) {
				this.error(error);
			} else {
				this.complete(data as any);
			}
		};
	}

	#timer?: TimeoutType;
	#cancel_timeout() {
		if (this.#timer) {
			clearTimeout(this.#timer);
			this.#timer = undefined;
		}
	}
	timeout(ms: number) {
		if (this.settled) throw new Error('no more timeout after settled');
		this.#timer = setTimeout(() => {
			this.error(new TimeoutError(ms, 'promise not settled'));
		}, ms);

		return {
			dispose: () => this.#cancel_timeout(),
		};
	}

	/**
	 * Convert promise into deferred
	 * returns a DeferredPromise, resolve when prev resolve, reject when prev reject
	 */
	static wrap(prev: Promise<any>) {
		const p = new DeferredPromise();
		prev.then(
			(d) => {
				p.complete(d);
			},
			(e) => {
				p.error(e);
			},
		);
		return p;
	}
}
