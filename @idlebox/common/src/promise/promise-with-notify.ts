import { isBuildMode } from '../platform/compile.js';
import { scheduler } from '../schedule/scheduler.js';

export type ProgressCallback<T = any> = (value: T) => void;

/**
 * 带有一个多次触发事件的Promise
 */
export interface IProgressHolder<TNotify> {
	progress(fn: ProgressCallback<TNotify>): this;
}

export type IPromiseWithProgress<T, TNotify> = Promise<T> & IProgressHolder<TNotify>;

export interface IPromiseWithNotify<T, TNotify> extends Promise<T>, IProgressHolder<TNotify> {}

type ResolveFn<T> = (value: T | PromiseLike<T>) => void;
type RejectFn = (reason?: any) => void;
type Executer<T, TNotify> = (resolve: ResolveFn<T>, reject: RejectFn, notify: ProgressCallback<TNotify>) => void;

export class PromiseAttachAsyncNotify<T, TNotify> {
	public readonly promise: IPromiseWithProgress<T, TNotify>;
	private readonly progressList: ProgressCallback<TNotify>[] = [];

	constructor(
		executor: Executer<T, TNotify>,
		private readonly nextTickNotify = false,
	) {
		const promise = new Promise<T>((resolve, reject) => {
			executor(resolve, reject, this.notify.bind(this));
		});

		promise.finally(() => {
			this.progressList.length = 0;
			if (!isBuildMode) Object.freeze(this.progressList);
		});

		this.promise = Object.assign(promise, {
			progress: (fn: ProgressCallback<TNotify>) => {
				this.progress(fn);
				return this.promise;
			},
		});
	}

	private progress(fn: ProgressCallback<TNotify>) {
		this.progressList.push(fn);
		return this;
	}

	private notify(value: TNotify): void {
		if (this.nextTickNotify) {
			for (const cb of this.progressList) {
				scheduler(cb.bind(undefined, value));
			}
		} else {
			for (const cb of this.progressList) {
				cb(value);
			}
		}
	}

	static withResolvers<T, TNotify>(nextTickNotify = false) {
		let resolve!: ResolveFn<T>, reject!: RejectFn, notify!: ProgressCallback<TNotify>;
		const promise = new PromiseAttachAsyncNotify<T, TNotify>((res, rej, not) => {
			resolve = res;
			reject = rej;
			notify = not;
		}, nextTickNotify);
		return {
			holder: promise,
			promise: promise.promise,
			resolve,
			reject,
			notify,
		};
	}
}
