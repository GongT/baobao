import { DisposedError } from './disposedError';
import { Emitter, EventRegister } from '../event/event';
import { IDisposable, IDisposableBaseInternal } from './lifecycle';

export class Disposable implements IDisposable, IDisposableBaseInternal {
	private readonly _disposables: IDisposable[] = [];

	protected readonly _onDisposeError = new Emitter<Error>();
	public readonly onDisposeError: EventRegister<Error> = this._onDisposeError.register;

	protected readonly _onBeforeDispose = new Emitter<void>();
	public readonly onBeforeDispose: EventRegister<void> = this._onBeforeDispose.register;

	private _disposed?: Error;

	public get hasDisposed() {
		return !!this._disposed;
	}

	protected assertNotDisposed() {
		if (this._disposed) {
			throw new DisposedError(this, this._disposed);
		}
	}

	protected _publicDispose() {
		if (this._disposed) {
			console.warn(new DisposedError(this, this._disposed).message);
			return false;
		}
		this._onBeforeDispose.fireNoError();
		this._disposed = new Error('disposed');
		return true;
	}

	public _register<T extends IDisposable>(d: T): T {
		this.assertNotDisposed();
		this._disposables.unshift(d);
		return d;
	}

	public dispose() {
		if (this._publicDispose()) {
			this._disposables.push(this._onBeforeDispose);
			this._disposables.push(this._onDisposeError);
			for (const item of this._disposables.values()) {
				try {
					item.dispose();
				} catch (e) {
					this._onDisposeError.fire(e);
				}
			}
		}
	}
}
