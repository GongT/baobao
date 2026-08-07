import { defineInspectMethod } from '../../debugging/inspect.js';
import type { MaybeNamed } from '../../debugging/object-with-name.js';
import { convertCaughtError } from '../../error/convert-unknown.js';
import { prettyPrintError } from '../../error/pretty.nodejs.js';
import { isBuildMode } from '../../platform/compile.js';
import { isPromiseLike } from '../../promise/is-promise.js';
import { mustNonNull } from '../../typing-helper/must-non-null.js';
import { Emitter } from '../event/event.js';
import type { EventRegister } from '../event/type.js';
import { fromNativeDisposable } from './bridges/native.js';
import { _debug_dispose, dispose_name, rememberParent } from './debug.js';
import { DisposedError, DuplicateDisposeError } from './disposedError.js';

export enum DuplicateDisposeAction {
	/**
	 * 禁止重复dispose，抛出异常
	 */
	Disable = 0,
	/**
	 * 禁止重复dispose，但只打印警告
	 */
	Warning = 1,
	/**
	 * 允许重复dispose，重复调用什么也不做
	 */
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
	trace?: DisposedError;
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

export enum CallAction {
	Noop = 0,
	Throw,
	Reject,
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

	// 设置字段
	/** 是否允许重复dispose，注意实际dispose逻辑永远只运行一次，后续dispose等待第一个异步dispose完成*/
	protected readonly duplicateDispose: DuplicateDisposeAction = DuplicateDisposeAction.Warning;

	/**
	 * the "DisposableStack"
	 */
	protected readonly _disposables: _Type<Async>[] = [];

	/** for debug */
	public readonly displayName?: string;

	/** @ts-ignore 禁止不使用debug库的项目报错 */
	protected readonly _logger: import('debug').Debugger;

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

	protected _destroyMethods(action: CallAction, ...names: (keyof this)[]) {
		if (isBuildMode) return;

		const destroy = (name: string) => {
			const trace = mustNonNull(this.__dispose_state.trace);
			if (action === CallAction.Throw) {
				return () => {
					throw new DisposedError(`调用了方法${name}()`, trace);
				};
			} else if (action === CallAction.Reject) {
				return () => {
					return Promise.reject(new DisposedError(`调用了方法${name}()`, trace));
				};
			} else {
				return () => {
					// noop
					console.error(`调用了方法${name}()，但对象已被释放`);
				};
			}
		};
		this._register({
			dispose: () => {
				for (const name of names) {
					if (Object.hasOwn(this, name)) delete this[name];
					this[name] = destroy(name as string) as any;
				}
			},
		});
	}

	/**
	 * 确保对象未被释放
	 * @throws DuplicateDisposeError
	 */
	public assertNotDisposed() {
		if (this.__dispose_state.trace) {
			throw new DuplicateDisposeError(this, this.__dispose_state.trace);
		}
	}

	/**
	 * 注册一个资源到本对象的生命周期中，当本对象被释放时，该资源也会被释放。
	 * 先注册的后释放
	 */
	public _register<T extends _Type<Async>>(d: T): T;
	public _register<T extends _Type<Async> & IBackReferenceDisposableEvent>(d: T, autoDereference?: boolean): T;
	public _register(d: any, autoDereference?: boolean): any {
		if (this._logger.enabled) this._logger(`资源注册 ${dispose_name(d)}`);
		this.assertNotDisposed();
		if (this._disposables.indexOf(d) !== -1) throw new Error(`资源对象 ${dispose_name(d)} 已经被注册到 "${dispose_name(this)}"`);
		this._disposables.unshift(fromNativeDisposable(d));
		if (autoDereference) {
			(d as IBackReferenceDisposableEvent).onBeforeDispose(() => {
				if (this.disposing || this.disposed) return;
				this._unregister(d);
			});
		}

		if ((d as any).duplicateDispose === DuplicateDisposeAction.Allow) {
			// 允许重复释放的对象不记录父对象引用，因为它们不会抛出异常
		} else {
			rememberParent(d, this, autoDereference === true);
		}

		return d;
	}

	/**
	 * 移除资源 (_register的逆操作)
	 * **不会释放资源**
	 *
	 * @returns 是否成功移除（注册过）
	 */
	public _unregister(d: _Type<Async>) {
		if (this._logger.enabled) this._logger(`资源移除 ${dispose_name(d)}`);
		this.assertNotDisposed();
		const rmOk = this._disposables.splice(this._disposables.indexOf(d), 1).length > 0;

		return rmOk;
	}

	private __dispose_state: IDisposeState<Async> = { finished: false };

	/**
	 * 已经完全释放
	 */
	public get disposed() {
		return this.__dispose_state.finished;
	}

	/**
	 * 正在dispose中（已开始但未完成）
	 */
	public get disposing() {
		// 使用 this.__dispose_state.trace 判断，因为它是dispose()中最先赋值的
		return !this.__dispose_state.finished && !!this.__dispose_state.trace;
	}

	/**
	 * 释放自身与相关资源
	 */
	public dispose(): _RType<Async> {
		if (this.__dispose_state.trace) {
			// 释放已开始或已结束
			if (this.duplicateDispose === DuplicateDisposeAction.Allow) {
				if (this.__dispose_state.error) {
					throw this.__dispose_state.error;
				} else {
					/**
					 * biome-ignore lint/style/noNonNullAssertion: 由于dispose本身同步，有trace必然有result
					 */
					return this.__dispose_state.result!;
				}
			}

			const dupErr = new DuplicateDisposeError(this, this.__dispose_state.trace);
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

		// * 第一时间设置trace
		this.__dispose_state.trace = new DisposedError();

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
				prettyPrintError('同步释放错误', err);
			}
			cleanup();
			throw this.__dispose_state.error;
		}

		let r = this.__dispose_state.result;
		if (isPromiseLike(r)) {
			// 异步错误处理
			r.catch((e) => {
				e = convertCaughtError(e);
				this._onDisposeError.fire(e);
				if (this._onDisposeError.listenerCount() === 0) {
					prettyPrintError('异步释放错误', e);
				}
			});
			r = r.finally(cleanup) as any;
			this.__dispose_state.result = r;
		} else {
			cleanup();
		}

		return r;
	}

	get [Symbol.toStringTag](): string {
		return this.displayName || '未知可释放对象';
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

export function dumpDisposableStack(disposable: AbstractEnhancedDisposable<any>) {
	console.error(`== 转储可释放对象栈: ${disposable.constructor.name}`);
	// biome-ignore lint/performance/useTopLevelRegex: never call
	const lSpace = / {3}$/;

	function inner(disposable: AbstractEnhancedDisposable<any>, level: number) {
		const pad = '  '.repeat(level);
		const _privateStacks: AbstractEnhancedDisposable<any>[] = (disposable as any)._disposables;
		let color;
		if (disposable.disposed) {
			color = '2';
		} else if (disposable.disposing) {
			color = '1';
		} else if (disposable.disposed === undefined) {
			color = '3';
		} else {
			color = '0';
		}
		let _r = `${pad.replace(lSpace, ' - ')}. ${dispose_name(disposable)} | `;

		if (_privateStacks) {
			_r += `释放中: ${disposable.disposing}, 已释放: ${disposable.disposed}, 注册数量: ${_privateStacks.length}`;

			console.error(`\x1B[${color}m%s\x1B[0m`, _r);
			for (const d of _privateStacks) {
				inner(d, level + 1);
			}
		} else {
			_r += `非增强资源对象`;
			if (disposable.disposing !== undefined) {
				_r += `, 释放中: ${disposable.disposing}`;
			}
			if (disposable.disposed !== undefined) {
				_r += `, 已释放: ${disposable.disposed}`;
			}
			console.error(`\x1B[${color}m%s\x1B[0m`, _r);
		}
	}

	inner(disposable, 0);
}
