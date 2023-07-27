import { Emitter, EventRegister } from '../event/event';
import { DisposedError } from './disposedError';
import { IDisposable, IDisposableEvents } from './lifecycle';

export abstract class DisposableOnce implements IDisposable {
	private _disposed?: Error;

	public get hasDisposed() {
		return !!this._disposed;
	}
	public dispose(): void {
		if (this._disposed) {
			console.warn(new DisposedError(this, this._disposed).message);
			return;
		}
		this._disposed = new Error('disposed');
		this._dispose();
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

	private _disposed?: Error;

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
		return this._disposables.splice(this._disposables.indexOf(d), 1).length > 0;
	}

	public dispose(): void {
		if (this._disposed) {
			console.warn(new DisposedError(this, this._disposed).message);
			return;
		}
		this._onBeforeDispose.fireNoError();
		this._disposed = new Error('disposed');

		this._disposables.push(this._onBeforeDispose);
		this._disposables.push(this._onDisposeError);
		for (const item of this._disposables.values()) {
			try {
				item.dispose();
			} catch (e) {
				if (e instanceof Error) {
					this._onDisposeError.fire(e);
				} else {
					console.error('error during dispose, throw:', e);
					this._onDisposeError.fire(new Error('' + e));
				}
			}
		}
	}
}
