import type { IDisposable } from '../dispose/lifecycle.js';
import { CanceledError } from './cancel.js';

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
	readonly p: Promise<T> & IProgressHolder<T, PT>;
	#completeCallback!: ValueCallback<T>;
	#errorCallback!: (err: any) => void;
	#success?: boolean;
	#progressList: ProgressCallback<PT>[] = [];

	constructor() {
		this.p = Object.assign(
			new Promise<any>((c, e) => {
				this.#completeCallback = c;
				this.#errorCallback = e;
			}),
			{
				progress: (fn: ProgressCallback<PT>) => {
					this.progress(fn);
					return this.p;
				},
			}
		);
	}

	notify(progress: PT): this {
		if (this.#success !== undefined) throw new Error('no more event after settled');
		for (const cb of this.#progressList) {
			cb(progress);
		}
		return this;
	}

	progress(fn: ProgressCallback<PT>): IDisposable {
		if (this.#success !== undefined) throw new Error('no more listener after settled');
		this.#progressList.push(fn);

		return {
			dispose: () => {
				const index = this.#progressList.indexOf(fn);
				if (index >= 0) {
					this.#progressList.splice(index, 1);
				}
			},
		};
	}

	get working(): boolean {
		return this.#success === undefined;
	}

	get completed(): boolean {
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
		this.#success = true;
		this.#completeCallback(value);
		this.#no_more_progress();
	}

	/**
	 * reject the promise
	 */
	error(err: any) {
		this.#success = false;
		this.#errorCallback(err);
		this.#no_more_progress();
	}

	/**
	 * reject the promise with CancelError
	 */
	cancel() {
		this.#success = false;
		this.#errorCallback(new CanceledError());
		this.#no_more_progress();
	}

	#no_more_progress() {
		this.#progressList.length = 0;
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
			}
		);
		return p;
	}
}
