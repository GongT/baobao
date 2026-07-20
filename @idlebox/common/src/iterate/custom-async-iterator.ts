import { CanceledError, InvalidStateError, UseAfterDisposeError } from '@idlebox/errors';
import { EnhancedAsyncDisposable } from '../lifecycle/dispose/async-disposable.js';
import type { IAsyncDisposable } from '../lifecycle/dispose/disposable.js';

/**
 * 被动的异步数据源，每个循环周期都会且只会产生一个数据，不迭代就不会产生数据
 */
export class PassiveAsyncDataSource<T> extends EnhancedAsyncDisposable {
	private error?: unknown;
	private finished = false;
	private busy = false;
	private readonly getNextData;

	constructor(onDataRequested: () => Promise<T>) {
		super(`PassiveAsyncDataSource`);
		this.getNextData = onDataRequested;
	}

	static chunked<T>(onDataRequested: () => Promise<T[]>): PassiveAsyncDataSource<T> {
		let buffer: T[] = [];
		return new PassiveAsyncDataSource<T>(async () => {
			if (buffer.length === 0) {
				buffer = await onDataRequested();
			}
			return buffer.shift()!;
		});
	}

	finish() {
		this.finished = true;
	}

	protected override _dispose(disposables: readonly IAsyncDisposable[]): Promise<void> {
		this.finished = true;

		UseAfterDisposeError.replaceMethods(this, 'finish', '_next');
		return super._dispose(disposables);
	}

	async _next(): Promise<IteratorResult<T, void>> {
		if (this.finished) {
			return { done: true, value: undefined };
		} else if (this.error) {
			throw this.error;
		} else if (this.busy) {
			throw new Error(`PassiveAsyncDataSource: 上一个next()调用尚未完成`);
		}

		this.busy = true;
		try {
			const data = await this.getNextData();
			return { done: false, value: data };
		} catch (err) {
			this.error = err;
			throw err;
		} finally {
			this.busy = false;
		}
	}
}

interface IActiveDataSourceOptions {
	/**
	 * 最大缓冲区大小，达到此大小时仍未消费的旧数据将被丢弃，默认10
	 */
	readonly maxBufferSize?: number;
	/**
	 * 缓冲区满时的处理策略，默认丢弃旧数据而非异常
	 */
	readonly throwOnBufferOverflow?: boolean;
}

/**
 * 主动的异步数据源，数据源主动产生数据，每个循环周期可能等待新数据，也可能消费之前已经产生的数据
 */
export class ActiveAsyncDataSource<T> extends EnhancedAsyncDisposable {
	private readonly maxBufferSize;
	private readonly throwOnBufferOverflow;

	private queue: T[] = [];
	private finished = false;
	private error?: unknown;
	private waiting?: PromiseWithResolvers<void>;

	constructor(options: IActiveDataSourceOptions = {}) {
		super(`ActiveAsyncDataSource`);

		this.maxBufferSize = options.maxBufferSize ?? 10;
		this.throwOnBufferOverflow = options.throwOnBufferOverflow ?? false;
	}

	protected override _dispose(disposables: readonly IAsyncDisposable[]): Promise<void> {
		if (this.waiting) {
			this.error = new CanceledError();
			this.waiting.resolve();
		} else {
			this.finished = true;
		}

		this.queue.length = 0;

		UseAfterDisposeError.replaceMethods(this, 'push', 'finish', 'throwError', '_next');

		return super._dispose(disposables);
	}

	/**
	 * 数据源产生了新数据
	 */
	push(nextData: T) {
		if (this.finished) {
			throw new InvalidStateError(`ActiveAsyncDataSource: 数据源已结束，无法再产生新数据`);
		} else if (this.error) {
			throw new InvalidStateError(`ActiveAsyncDataSource: 数据源已出现异常，无法再产生新数据`, { cause: this.error });
		}
		this.queue.push(nextData);
		while (this.queue.length > this.maxBufferSize) {
			if (this.throwOnBufferOverflow) {
				throw new Error(`ActiveAsyncDataSource: 缓冲区已满`);
			}
			this.queue.shift();
		}

		if (this.waiting) this.waiting.resolve();
	}

	/**
	 * 数据源正常结束
	 */
	finish() {
		if (this.error) {
			throw new InvalidStateError(`ActiveAsyncDataSource: 数据源已出现异常，无法设为正常结束`, { cause: this.error });
		}

		this.finished = true;

		if (this.waiting) this.waiting.resolve();
	}

	/**
	 * 数据源出现异常
	 */
	throwError(err: unknown) {
		if (this.finished) {
			throw new InvalidStateError(`ActiveAsyncDataSource: 数据源已结束，无法再抛出异常`, { cause: err });
		} else if (this.error) {
			throw new InvalidStateError(`ActiveAsyncDataSource: 数据源已出现异常，无法再抛出异常`, { cause: err });
		}
		this.error = err;

		if (this.waiting) this.waiting.resolve();
	}

	debugDump() {
		return {
			queue: this.queue,
			finished: this.finished,
			error: this.error,
			waiting: !!this.waiting,
		};
	}

	async _next(loopGuard = false): Promise<IteratorResult<T, void>> {
		if (this.waiting) {
			if (!loopGuard) throw new Error(`ActiveAsyncDataSource: 上一个next()调用尚未完成`);
		}

		// 有数据或者已经结束或者出现异常，直接返回
		if (this.queue.length > 0) {
			// biome-ignore lint/style/noNonNullAssertion: length>0
			const data = this.queue.shift()!;
			return { done: false, value: data };
		} else if (this.finished) {
			return { done: true, value: undefined };
		} else if (this.error) {
			throw this.error;
		} else if (loopGuard) {
			throw new Error(`状态异常: ActiveAsyncDataSource._next()被递归调用`);
		}

		// 没有数据可消费，等待新数据产生
		this.waiting = Promise.withResolvers<void>();
		try {
			await this.waiting.promise;

			if (this.error) {
				throw this.error;
			}

			return this._next(true);
		} finally {
			this.waiting = undefined;
		}
	}
}

/**
 * 自定义的异步迭代器，用于异步数据源，并被for await...of循环消费
 *
 * 不支持throw方法，且return不返回值
 */
export function createAsyncIterator<T>(dataSource: PassiveAsyncDataSource<T> | ActiveAsyncDataSource<T>): AsyncIterable<T, void> & AsyncDisposable {
	let disposed = false;

	function localDispose() {
		// console.error('-->DISPOSE');
		disposed = true;
		return dataSource.dispose();
	}

	return {
		[Symbol.asyncIterator]: () => {
			return {
				next: async () => {
					let r;

					try {
						r = await dataSource._next();
					} catch (e) {
						// console.error('-->SOURCE ERROR');
						if (!disposed) await localDispose();
						throw e;
					}
					// console.error('-->', r);

					// 返回了done=true，说明数据源已经结束，且没有提前返回，需要调用dispose()
					if (r.done && !disposed) await localDispose();

					return r;
				},
				return: async () => {
					// 提前结束循环需要调用dispose()
					// console.error('-->RETURN');
					if (!disposed) await localDispose();

					return { done: true } as any;
				},
				throw: async () => {
					throw new Error(`createAsyncIterator仅用于for await...of循环消费，不支持throw方法`);
				},
			} as any;
		},
		async [Symbol.asyncDispose]() {
			if (!disposed) await localDispose();
		},
	};
}
