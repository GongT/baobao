import { CanceledError, TimeoutError } from '@idlebox/errors';
import { PromiseAttachAsyncNotify, type IPromiseWithProgress, type ProgressCallback } from './promise-with-notify.js';

export type ValueCallback<T = any> = (value: T | Promise<T>) => void;

/**
 * a promise can resolve or reject later
 * @public
 */
export class DeferredPromise<T, PT = any> {
	public readonly promise: IPromiseWithProgress<T, PT>;
	#completeCallback: ValueCallback<T>;
	#errorCallback: (err: any) => void;
	#success?: boolean;

	public readonly progress;
	protected readonly notify;

	constructor() {
		const { promise, resolve, reject, notify } = PromiseAttachAsyncNotify.withResolvers<T, PT>(true);
		this.#completeCallback = resolve;
		this.#errorCallback = reject;

		this.promise = promise;
		this.progress = (fn: ProgressCallback<PT>) => {
			promise.progress(fn);
			return this;
		};
		this.notify = notify;

		Object.assign(promise, { progress: this.progress });
	}

	get p() {
		return this.promise;
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
		this.cancel_timeout();
		this.#completeCallback(value);
	}

	/**
	 * reject the promise
	 */
	error(err: any) {
		if (this.settled) return;
		this.#success = false;
		this.cancel_timeout();
		this.#errorCallback(err);
	}

	/**
	 * reject the deferred with {CancelError}
	 */
	cancel() {
		this.error(new CanceledError());
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

	private timer?: ITimeoutType;
	timeout(ms: number) {
		if (this.settled) throw new Error('no more timeout after settled');
		this.timer = setTimeout(() => {
			this.error(new TimeoutError(ms, 'promise not settled'));
		}, ms);

		return {
			dispose: () => this.cancel_timeout(),
		};
	}
	private cancel_timeout() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}
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
