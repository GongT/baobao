import type { MaybeNamed } from '../../debugging/object-with-name.js';
import { createStackTraceHolder, type StackTraceHolder } from '../../error/stack-trace.js';
import { Emitter } from '../event/event.js';
import type { EventRegister } from '../event/type.js';
import { fromNativeDisposable } from './bridges/native.js';
import { _debug_dispose, dispose_name } from './debug.js';
import { DuplicateDisposed } from './disposedError.js';

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
	protected readonly _onDisposeError = new Emitter<Error>();
	public readonly onDisposeError: EventRegister<Error> = this._onDisposeError.register;

	protected readonly _onBeforeDispose = new Emitter<void>();
	public readonly onBeforeDispose: EventRegister<void> = this._onBeforeDispose.register;

	protected readonly _onPostDispose = new Emitter<void>();
	public readonly onPostDispose: EventRegister<void> = this._onPostDispose.register;

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

		this._logger = _debug_dispose.extend(this.displayName || 'disposable');

		this._onPostDispose.handle(() => {
			this._onPostDispose.dispose();
		});
		this._disposables.push(this._onBeforeDispose);
		this._disposables.push(this._onDisposeError);
	}

	/**
	 * @throws if already disposed
	 */
	public assertNotDisposed() {
		if (this._disposed) {
			throw new DuplicateDisposed(this, this._disposed.trace);
		}
	}

	/**
	 * the "DisposableStack"
	 */
	protected readonly _disposables: _Type<Async>[] = [];

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
		return d;
	}

	public _unregister(d: _Type<Async>) {
		if (this._logger.enabled) this._logger(`unregister ${dispose_name(d)}`);
		this.assertNotDisposed();
		return this._disposables.splice(this._disposables.indexOf(d), 1).length > 0;
	}

	protected readonly duplicateDispose: DuplicateDisposeAction = DuplicateDisposeAction.Warning;
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

			const dupErr = new DuplicateDisposed(this, this._disposed.trace);
			if (this.duplicateDispose === DuplicateDisposeAction.Disable) {
				throw dupErr;
			} else {
				console.warn(dupErr);
				return this._disposed.result;
			}
		}
		this._onBeforeDispose.fireNoError();

		const r = this._dispose(this._disposables);
		const cleanup = () => {
			this._disposables.length = 0;
			Object.freeze(this._disposables);
		};
		if (r && 'then' in r) {
			r.finally(cleanup);
		} else {
			cleanup();
		}

		this._disposed = {
			trace: createStackTraceHolder('disposed', this.dispose),
			result: r,
		};

		return r;
	}

	get [Symbol.toStringTag](): string {
		return this.displayName || 'unknown disposable';
	}

	protected abstract _dispose(disposables: readonly _Type<Async>[]): _RType<Async>;
}
