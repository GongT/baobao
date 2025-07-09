import { createStackTraceHolder, type StackTraceHolder } from '../../error/stackTrace.js';
import { Emitter, type EventRegister } from '../event/event.js';
import { _debug_dispose, dispose_name } from './debug.js';
import { DisposedError } from './disposedError.js';
import type { IDisposable, IDisposableEvents } from './lifecycle.js';

interface _DOMDisposable {
	[Symbol.dispose](): void;
}

export abstract class DisposableOnce implements IDisposable {
	private _disposed?: StackTraceHolder;

	public get hasDisposed() {
		return !!this._disposed;
	}
	public dispose(): void {
		if (this._disposed) {
			console.warn(new DisposedError(this, this._disposed).message);
			return;
		}
		this._disposed = createStackTraceHolder('disposed', this.dispose);
		this._dispose();
	}

	toWeb(): _DOMDisposable {
		return this;
	}
	static fromWeb(disposable: _DOMDisposable): IDisposable {
		if (!('dispose' in disposable)) {
			Object.assign(disposable, { dispose: disposable[Symbol.dispose] });
		}
		return disposable as unknown as IDisposable;
	}
	[Symbol.dispose]() {
		this.dispose();
	}
	protected abstract _dispose(): void;
}

/**
 * Standalone disposable class, can use as instance or base class.
 */
export class Disposable implements IDisposable, IDisposableEvents {
	private readonly _disposables: IDisposable[] = [];

	protected readonly _onDisposeError = new Emitter<Error>();
	public readonly onDisposeError: EventRegister<Error> = this._onDisposeError.register;

	protected readonly _onBeforeDispose = new Emitter<void>();
	public readonly onBeforeDispose: EventRegister<void> = this._onBeforeDispose.register;

	private _disposed?: StackTraceHolder;

	/** @internal */
	readonly #logger;
	constructor(public readonly displayName?: string) {
		this.#logger = _debug_dispose.extend(this.displayName || 'disposable');
	}

	public get hasDisposed() {
		return !!this._disposed;
	}

	/**
	 * @throws if already disposed
	 */
	public assertNotDisposed() {
		if (this._disposed) {
			throw new DisposedError(this, this._disposed);
		}
	}

	/**
	 * register a disposable object
	 */
	public _register<T extends IDisposable>(d: T): T;
	public _register<T extends IDisposable & IDisposableEvents>(d: T, autoDereference?: boolean): T;
	public _register<T extends IDisposable | (IDisposable & IDisposableEvents)>(d: T, autoDereference?: boolean): T {
		if (this.#logger.enabled) this.#logger(`register ${dispose_name(d)}`);
		this.assertNotDisposed();
		this._disposables.unshift(d);
		if (autoDereference) {
			(d as IDisposableEvents).onBeforeDispose(() => {
				this._unregister(d);
			});
		}
		return d;
	}

	public _unregister(d: IDisposable) {
		if (this.#logger.enabled) this.#logger(`unregister ${dispose_name(d)}`);
		return this._disposables.splice(this._disposables.indexOf(d), 1).length > 0;
	}

	toWeb(): _DOMDisposable {
		return this;
	}
	static fromWeb(disposable: _DOMDisposable): IDisposable {
		if (!('dispose' in disposable)) {
			Object.assign(disposable, { dispose: disposable[Symbol.dispose] });
		}
		return disposable as unknown as IDisposable;
	}
	[Symbol.dispose]() {
		this.dispose();
	}

	public dispose(): void {
		if (this._disposed) {
			console.warn(new DisposedError(this, this._disposed).message);
			return;
		}
		this._onBeforeDispose.fireNoError();
		this._disposed = createStackTraceHolder('disposed', this.dispose);

		this._disposables.push(this._onBeforeDispose);
		this._disposables.push(this._onDisposeError);
		for (const item of this._disposables.values()) {
			try {
				if (this.#logger.enabled) this.#logger(`dispose ${dispose_name(item)}`);
				item.dispose();
			} catch (e) {
				if (e instanceof Error) {
					this._onDisposeError.fire(e);
				} else {
					console.error('error during dispose, throw:', e);
					this._onDisposeError.fire(new Error(`${e}`));
				}
			}
		}
	}
}
