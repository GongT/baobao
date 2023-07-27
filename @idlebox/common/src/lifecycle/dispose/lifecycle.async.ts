import { convertCatchedError } from '../../error/convertUnknown';
import { Emitter, EventRegister } from '../event/event';
import { DisposedError } from './disposedError';
import { IAsyncDisposable, IDisposableEvents } from './lifecycle';

/**
 * Async version of Disposable
 * @public
 */
export class AsyncDisposable implements IAsyncDisposable, IDisposableEvents {
	private readonly _disposables: IAsyncDisposable[] = [];

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
	public _register<T extends IAsyncDisposable>(d: T): T;
	public _register<T extends IAsyncDisposable & IDisposableEvents>(d: T, autoDereference?: boolean): T;
	public _register<T extends IAsyncDisposable | (IAsyncDisposable & IDisposableEvents)>(d: T, deref?: boolean): T {
		this.assertNotDisposed();
		this._disposables.unshift(d);
		if (deref) {
			(d as IDisposableEvents).onBeforeDispose(() => {
				this._unregister(d);
			});
		}
		return d;
	}

	public _unregister(d: IAsyncDisposable) {
		return this._disposables.splice(this._disposables.indexOf(d), 1).length > 0;
	}

	public async dispose(): Promise<void> {
		if (this._disposed) {
			console.warn(new DisposedError(this, this._disposed).message);
			return;
		}
		this._onBeforeDispose.fireNoError();
		this._disposed = new Error('disposed');

		this._disposables.push(this._onBeforeDispose);
		this._disposables.push(this._onDisposeError);
		for (const cb of this._disposables) {
			try {
				await cb.dispose();
			} catch (e) {
				this._onDisposeError.fire(convertCatchedError(e));
			}
		}
	}
}
