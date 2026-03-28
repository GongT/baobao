import { defineInspectMethod, inspectSymbol } from '../../debugging/inspect.js';
import { nameObject, objectName } from '../../debugging/object-with-name.js';
import { convertCaughtError } from '../../error/convert-unknown.js';
import { prettyPrintError } from '../../error/pretty.nodejs.js';
import { createStackTraceHolder } from '../../error/stack-trace.js';
import { functionToDisposable } from '../dispose/bridges/function.js';
import type { IDisposable } from '../dispose/disposable.js';
import { DisposedError } from '../dispose/disposedError.js';
import type { EventHandler, EventRegister, IEventEmitter } from './type.js';

const anonymousName = 'AnonymousEmitter';

enum FireErrorAction {
	Throw = 0,
	Delay = 1,
	Ignore = 2,
	PrintIgnore = 3,
}

/**
 * @public
 */
export class Emitter<T = unknown> implements IEventEmitter<T> {
	protected readonly _callbacks: (EventHandler<T> | undefined)[] = [];
	private executing = false;
	private _something_change_during_call = false;

	static readonly EAction = FireErrorAction;

	constructor(
		public readonly displayName: string = anonymousName,
		private readonly onErrorDefault: FireErrorAction = FireErrorAction.Throw,
	) {
		this.handle = Object.defineProperties(this.handle.bind(this), {
			once: {
				get: () => this.once.bind(this),
			},
			wait: {
				get: () => this.wait.bind(this),
			},
			disposed: {
				get: () => this._disposed,
			},
		});
		defineInspectMethod(this.handle, (_depth, options) => {
			return options.stylize(`[EmitterRegister ${this.displayName}]`, 'special');
		});
	}

	public listenerCount() {
		return this._callbacks.length;
	}

	private __fireThrow(data: T) {
		for (const callback of this._callbacks) {
			callback?.(data);
		}
	}
	private __fireDelay(data: T) {
		const errors: Error[] = [];
		for (const callback of this._callbacks) {
			try {
				callback?.(data);
			} catch (e) {
				errors.push(convertCaughtError(e));
			}
		}
		return errors;
	}
	private __fireIgnore(data: T) {
		for (const callback of this._callbacks) {
			try {
				callback?.(data);
			} catch {}
		}
	}
	private __firePrintIgnore(data: T) {
		for (const callback of this._callbacks) {
			try {
				callback?.(data);
			} catch (e) {
				const ee = convertCaughtError(e);
				prettyPrintError('error while handling event', ee);
			}
		}
	}

	/**
	 * @param data
	 * @param error {Emitter.EAction} 如何处理错误
	 *  - Throw: 默认行为，遇到错误立即抛出，后续监听器不再被调用
	 *  - Delay: 等所有监听器都调用完后，如果有错误则抛出AggregateError，包含所有错误
	 *  - Ignore: 忽略所有错误，继续调用全部监听器
	 *  - PrintIgnore: 忽略所有错误，但打印错误信息
	 * @returns
	 */
	public fire(data: T, error = this.onErrorDefault) {
		this.requireNotExecuting();
		if (!this._callbacks.length) return;

		this.executing = true;
		try {
			if (error === FireErrorAction.Throw) {
				this.__fireThrow(data);
			} else if (error === FireErrorAction.Delay) {
				const errors = this.__fireDelay(data);
				if (errors.length) {
					throw new AggregateError(errors, 'multiple errors while handling event');
				}
			} else if (error === FireErrorAction.Ignore) {
				this.__fireIgnore(data);
			} else if (error === FireErrorAction.PrintIgnore) {
				this.__firePrintIgnore(data);
			}
		} finally {
			this.executing = false;
			if (this._something_change_during_call) {
				this.checkDeleted();
			}
		}
	}

	/** @deprecated use fire(data, Emitter.Error.Ignore) */
	public fireNoError(data: T) {
		this.fire(data, FireErrorAction.Ignore);
	}

	get register(): EventRegister<T> {
		return this.handle as any;
	}

	get event(): EventRegister<T> {
		return this.handle as any;
	}

	/**
	 * 添加监听器
	 * 这个实例方法已经bind过
	 */
	handle(callback: EventHandler<T>): IDisposable {
		this.requireNotExecuting();

		this._callbacks.unshift(callback);

		return functionToDisposable(
			nameObject(`removeListener(${objectName(callback)})`, () => {
				const index = this._callbacks.indexOf(callback);
				if (index === -1) return;
				if (this.executing) {
					this._something_change_during_call = true;
					this._callbacks[index] = undefined;
				} else {
					this._callbacks.splice(index, 1);
				}
			}),
		);
	}

	/**
	 * 添加一次性监听器
	 */
	once(callback: EventHandler<T>): IDisposable {
		this.requireNotExecuting();
		const disposable = this.handle((data) => {
			callback(data);
			disposable.dispose();
		});
		return disposable;
	}

	/**
	 * 创建一个等待下次触发的promise
	 */
	private _waittings?: Set<Function>;
	wait(): Promise<T> {
		return new Promise((resolve, reject) => {
			if (!this._waittings) this._waittings = new Set<Function>();
			this._waittings.add(reject);
			this.once((data) => {
				resolve(data);
			});
		});
	}

	private checkDeleted() {
		if (!this._callbacks) return;

		for (let i = this._callbacks.length - 1; i >= 0; i--) {
			if (this._callbacks[i] === undefined) {
				this._callbacks.splice(i, 1);
			}
		}
	}

	private _disposed = false;
	public get disposed() {
		return this._disposed;
	}

	/**
	 * 运行过程中可以dispose，本次运行仍然会继续到最后
	 * 但立即不能再次调用类似handle的方法
	 */
	dispose() {
		if (this._disposed) return;
		this._disposed = true;

		this._callbacks.length = 0;
		Object.assign(this, { _callbacks: null });

		if (this._waittings) {
			for (const rej of this._waittings) {
				rej(new Error('disposed'));
			}
		}

		this._waittings = undefined;

		const trace = createStackTraceHolder('disposed', this.dispose);

		const makeUnCallable = (name: string) => {
			Object.assign(this, {
				[name]() {
					throw new DisposedError(`can not call ${this.displayName}#${name}() after event emitter disposed`, trace);
				},
			});
		};

		makeUnCallable('fire');
		makeUnCallable('fireNoError');
		makeUnCallable('handle');
		makeUnCallable('requireNotExecuting');
	}

	readonly [Symbol.dispose] = this.dispose;

	[inspectSymbol](_depth: number, options: any) {
		let r = `${options.stylize(this.constructor.name, 'name')} {`;
		if (this.displayName !== anonymousName) {
			r += ` ${options.stylize(this.displayName, 'string')},`;
		}
		r += ` listeners: ${options.stylize(this.listenerCount(), 'number')}`;

		r += ' }';
		return r;
	}

	private requireNotExecuting() {
		if (this.executing) {
			throw new Error('conflict state, emitter is firing');
		}
	}
}
