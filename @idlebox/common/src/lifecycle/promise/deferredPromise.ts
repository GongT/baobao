import { CanceledError } from './cancel';

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
	public readonly p: Promise<T> & IProgressHolder<T, PT>;
	private declare _completeCallback: ValueCallback<T>;
	private declare _errorCallback: (err: any) => void;
	private _state: boolean | null = null;
	private _progressList?: ProgressCallback<PT>[] = [];

	constructor() {
		this.p = Object.assign(
			new Promise<any>((c, e) => {
				this._completeCallback = c;
				this._errorCallback = e;
			}),
			{
				progress: (fn: ProgressCallback<PT>) => {
					this.progress(fn);
					return this.p;
				},
			}
		);
		this.p
			.finally(() => {
				delete this._progressList;
			})
			.catch(() => void 0);
	}

	notify(progress: PT): this {
		for (const cb of this._progressList!) {
			cb(progress);
		}
		return this;
	}

	progress(fn: ProgressCallback<PT>): void {
		this._progressList!.push(fn);
	}

	get completed(): boolean {
		return typeof this._state === 'boolean';
	}

	get resolved(): boolean {
		return this._state === true;
	}

	get rejected(): boolean {
		return this._state === false;
	}

	/**
	 * resolve the promise
	 */
	public complete(value: T) {
		this._state = true;
		this._completeCallback(value);
	}

	/**
	 * reject the promise
	 */
	public error(err: any) {
		this._state = false;
		this._errorCallback(err);
	}

	/**
	 * reject the promise with CancelError
	 */
	public cancel() {
		this._state = false;
		this._errorCallback(new CanceledError());
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
