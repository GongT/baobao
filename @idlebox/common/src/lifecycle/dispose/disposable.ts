import { defineInspectMethod } from '../../debugging/inspect.js';
import type { MaybeNamed } from '../../debugging/object-with-name.js';
import { convertCaughtError } from '../../error/convert-unknown.js';
import { prettyPrintError } from '../../error/pretty.nodejs.js';
import { createStackTraceHolder, type StackTraceHolder } from '../../error/stack-trace.js';
import { isPromiseLike } from '../../promise/is-promise.js';
import { Emitter } from '../event/event.js';
import type { EventRegister } from '../event/type.js';
import { fromNativeDisposable } from './bridges/native.js';
import { _debug_dispose, dispose_name, forgetParent, rememberParent } from './debug.js';
import { DuplicateDisposedError } from './disposedError.js';

export enum DuplicateDisposeAction {
	Disable = 0,
	Warning = 1,
	Allow = 2,
}

/** @public */
export interface IDisposableEvents extends IBackReferenceDisposableEvent {
	readonly onDisposeError: EventRegister<Error>;
	readonly onPostDispose: EventRegister<void>;
	readonly disposed: boolean;
}

export interface IBackReferenceDisposableEvent {
	readonly onBeforeDispose: EventRegister<void>;
}

/** @public */
export interface IDisposable extends MaybeNamed {
	dispose(): void;
}

/** @public */
export interface IAsyncDisposable extends MaybeNamed {
	dispose(): void | Promise<void>;
}

type _Type<Async extends boolean> = Async extends true ? IAsyncDisposable : IDisposable;
type _RType<Async extends boolean> = Async extends true ? Promise<void> : void;

interface IDisposeState<Async extends boolean> {
	/**
	 * 存在stack说明dispose已经开始（可能已经完成）
	 */
	trace?: StackTraceHolder;
	finished: boolean;
	/**
	 * 同步的是undefined，异步的是Promise
	 */
	result?: _RType<Async>;
	/**
	 * 只有同步的用到，每次调用始终抛出相同错误，异步通过promise保存状态
	 */
	error?: Error;
}

/**
 * 增强型Disposable
 */
export abstract class AbstractEnhancedDisposable<Async extends boolean> implements IDisposableEvents {
	protected readonly _onDisposeError;
	public readonly onDisposeError;
	protected readonly _onBeforeDispose;
	public readonly onBeforeDispose;
	protected readonly _onPostDispose;
	public readonly onPostDispose;

	/** settings */
	protected readonly duplicateDispose: DuplicateDisposeAction = DuplicateDisposeAction.Warning;

	/**
	 * the "DisposableStack"
	 */
	protected readonly _disposables: _Type<Async>[] = [];

	/** for debug */
	public readonly displayName?: string;
	protected readonly _logger;

	constructor(displayName?: string) {
		if (displayName !== undefined) {
			this.displayName = displayName;
		} else if (!this.displayName) {
			displayName = dispose_name(this, 'AsyncDisposable');
			this.displayName = displayName;
		}

		this._logger = defineInspectMethod(_debug_dispose.extend(this.displayName || 'disposable'), () => {
			return `[Function debug]`;
		});

		this._onDisposeError = new Emitter<Error>(`${this.displayName}:errorEvent`, Emitter.EAction.PrintIgnore);
		this.onDisposeError = this._onDisposeError.register;
		this._onBeforeDispose = new Emitter<void>(`${this.displayName}:beforeEvent`, Emitter.EAction.PrintIgnore);
		this.onBeforeDispose = this._onBeforeDispose.register;
		this._onPostDispose = new Emitter<void>(`${this.displayName}:postEvent`, Emitter.EAction.PrintIgnore);
		this.onPostDispose = this._onPostDispose.register;
	}

	/**
	 * @throws if already disposed
	 */
	public assertNotDisposed() {
		if (this.__dispose_state.trace) {
			throw new DuplicateDisposedError(this, this.__dispose_state.trace);
		}
	}

	/**
	 * register a disposable object
	 */
	public _register<T extends _Type<Async>>(d: T): T;
	public _register<T extends _Type<Async> & IBackReferenceDisposableEvent>(d: T, autoDereference?: boolean): T;
	public _register(d: any, autoDereference?: boolean): any {
		if (this._logger.enabled) this._logger(`register ${dispose_name(d)}`);
		this.assertNotDisposed();
		if (this._disposables.indexOf(d) !== -1) throw new Error(`disposable object ${dispose_name(d)} has already registed into "${dispose_name(this)}"`);
		this._disposables.unshift(fromNativeDisposable(d));
		if (autoDereference) {
			(d as IBackReferenceDisposableEvent).onBeforeDispose(() => {
				if (this.disposing || this.disposed) return;
				this._unregister(d);
			});
		}

		rememberParent(d, this);

		return d;
	}

	public _unregister(d: _Type<Async>) {
		if (this._logger.enabled) this._logger(`unregister ${dispose_name(d)}`);
		this.assertNotDisposed();
		const rmOk = this._disposables.splice(this._disposables.indexOf(d), 1).length > 0;

		if (rmOk) forgetParent(d, this);

		return rmOk;
	}

	private __dispose_state: IDisposeState<Async> = { finished: false };
	public get disposed() {
		return this.__dispose_state.finished;
	}

	/**
	 * 正在dispose中（已开始但未完成）
	 */
	public get disposing() {
		return !this.__dispose_state.finished && !!this.__dispose_state.trace;
	}

	/**
	 * 释放相关资源
	 */
	public dispose(): _RType<Async> {
		if (this.__dispose_state.trace) {
			// 释放已开始或已结束
			if (this.duplicateDispose === DuplicateDisposeAction.Allow) {
				if (this.__dispose_state.error) {
					throw this.__dispose_state.error;
				} else {
					/**
					 * biome-ignore lint/style/noNonNullAssertion: 完全无需考虑
					 *
					 * 异步dispose的同步部分，重复调用dispose，会返回undefined而非Promise
					 * 但这正好是希望的，否则死锁了
					 */
					return this.__dispose_state.result!;
				}
			}

			const dupErr = new DuplicateDisposedError(this, this.__dispose_state.trace);
			dupErr.consoleWarning();
			if (this.duplicateDispose === DuplicateDisposeAction.Disable) {
				throw dupErr;
			} else {
				return this.__dispose_state.result as any;
			}
			// never
		}

		const cleanup = () => {
			this.__dispose_state.finished = true;

			Object.assign(this, { _disposables: null });
			this._onPostDispose.fire();
			this._onPostDispose.dispose();

			this._onDisposeError.dispose();
		};

		// 第一时间设置trace
		this.__dispose_state.trace = createStackTraceHolder('disposed', this.dispose);

		this._onBeforeDispose.fire();
		this._onBeforeDispose.dispose();

		try {
			this.__dispose_state.result = this._dispose(this._disposables);
		} catch (e) {
			// 同步错误处理
			const err = convertCaughtError(e);
			this.__dispose_state.error = err;
			this._onDisposeError.fire(err);
			if (this._onDisposeError.listenerCount() === 0) {
				prettyPrintError('unhandled sync dispose error', err);
			}
			cleanup();
			throw this.__dispose_state.error;
		}

		const r = this.__dispose_state.result;
		if (isPromiseLike(r)) {
			// 异步错误处理
			r.catch((e) => {
				e = convertCaughtError(e);
				this._onDisposeError.fire(e);
				if (this._onDisposeError.listenerCount() === 0) {
					prettyPrintError('unhandled async dispose error', e);
				}
			}).finally(cleanup);
		} else {
			cleanup();
		}

		return r;
	}

	get [Symbol.toStringTag](): string {
		return this.displayName || 'unknown disposable';
	}

	protected abstract _dispose(disposables: readonly _Type<Async>[]): _RType<Async>;
}

defineInspectMethod(AbstractEnhancedDisposable.prototype, function (this: any, _depth: number, options: any) {
	if (
		this.constructor.name === 'EnhancedAsyncDisposable' ||
		this.constructor.name === 'UnorderedAsyncDisposable' ||
		this.constructor.name === 'EnhancedDisposable'
	) {
		return options.stylize(`[${this.constructor.name} ${this.displayName}]`, 'special');
	}
});
