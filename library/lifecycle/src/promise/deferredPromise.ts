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
	// @ts-ignore
	private _completeCallback: ValueCallback<T>;
	// @ts-ignore
	private _errorCallback: (err: any) => void;
	private _state: boolean | null = null;
	private _progressList: ProgressCallback<PT>[] = [];

	constructor() {
		this.p = Object.assign(new Promise<any>((c, e) => {
			this._completeCallback = c;
			this._errorCallback = e;
		}), {
			progress: (fn: ProgressCallback<PT>) => {
				this.progress(fn);
				return this.p;
			},
		});
		this.p.finally(() => {
			delete this._progressList;
		});
	}

	notify(progress: PT): this {
		for (const cb of this._progressList) {
			cb(progress);
		}
		return this;
	}

	progress(fn: ProgressCallback<PT>): void {
		this._progressList.push(fn);
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

	public complete(value: T) {
		this._state = true;
		this._completeCallback(value);
	}

	public error(err: any) {
		this._state = false;
		this._errorCallback(err);
	}

	public cancel() {
		this._state = false;
		this._errorCallback(new CanceledError());
	}
}
