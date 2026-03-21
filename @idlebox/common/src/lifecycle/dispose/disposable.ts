import { definePublicConstant } from '../../autoindex.js';
import { defineInspectMethod } from '../../debugging/inspect.js';
import type { MaybeNamed } from '../../debugging/object-with-name.js';
import { createStackTraceHolder, type StackTraceHolder } from '../../error/stack-trace.js';
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
export interface IDisposableEvents {
	onDisposeError: EventRegister<Error>;
	onBeforeDispose: EventRegister<void>;
	readonly hasDisposed: boolean;
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

		this._onDisposeError = this._register(new Emitter<Error>(`${this.displayName}:errorEvent`));
		this.onDisposeError = this._onDisposeError.register;
		this._onBeforeDispose = this._register(new Emitter<void>(`${this.displayName}:beforeEvent`));
		this.onBeforeDispose = this._onBeforeDispose.register;
		this._onPostDispose = new Emitter<void>(`${this.displayName}:postEvent`);
		this.onPostDispose = this._onPostDispose.register;
	}

	/**
	 * @throws if already disposed
	 */
	public assertNotDisposed() {
		if (this._disposed) {
			throw new DuplicateDisposedError(this, this._disposed.trace);
		}
	}

	/**
	 * register a disposable object
	 */
	public _register<T extends _Type<Async>>(d: T): T;
	public _register<T extends _Type<Async> & IDisposableEvents>(d: T, autoDereference?: boolean): T;
	public _register(d: any, autoDereference?: boolean): any {
		if (this._logger.enabled) this._logger(`register ${dispose_name(d)}`);
		this.assertNotDisposed();
		if (this._disposables.indexOf(d) !== -1) throw new Error(`disposable object ${dispose_name(d)} has already registed into "${dispose_name(this)}"`);
		this._disposables.unshift(fromNativeDisposable(d));
		if (autoDereference) {
			(d as IDisposableEvents).onBeforeDispose(() => {
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

	private _disposed?: {
		trace: StackTraceHolder;
		result: _RType<Async>;
	};
	public get disposed() {
		return !!this._disposed;
	}
	/**
	 * @deprecated use disposed
	 */
	public get hasDisposed() {
		return !!this._disposed;
	}

	/**
	 * 释放相关资源
	 */
	public dispose(): _RType<Async> {
		if (this._disposed) {
			if (this.duplicateDispose === DuplicateDisposeAction.Allow) return this._disposed.result;

			const dupErr = new DuplicateDisposedError(this, this._disposed.trace);
			dupErr.consoleWarning();
			if (this.duplicateDispose === DuplicateDisposeAction.Disable) {
				throw dupErr;
			} else {
				return this._disposed.result;
			}
		}
		this._onBeforeDispose.fireNoError();

		const r = this._dispose(this._disposables);
		const trace = createStackTraceHolder('disposed', this.dispose);
		const cleanup = () => {
			definePublicConstant(this, '_disposed', {
				// 记录 disposed 状态，顺便也记录调用栈
				trace: trace,
				result: r,
			});

			Object.assign(this, { _disposables: null });
			this._onPostDispose.fireNoError();
			this._onPostDispose.dispose();
		};
		if (r && 'then' in r) {
			r.finally(cleanup);
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
