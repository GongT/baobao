import { DisposedError } from '@idlebox/errors';
import { Emitter, EventRegister } from './event';
import { IAsyncDisposable, IDisposableBaseInternal } from './lifecycle';

export class AsyncDisposable implements IAsyncDisposable, IDisposableBaseInternal {
	private readonly _disposables: IAsyncDisposable[] = [];

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

	public _register<T extends IAsyncDisposable>(d: T): T {
		this.assertNotDisposed();
		this._disposables.unshift(d);
		return d;
	}

	public async dispose() {
		if (this._publicDispose()) {
			this._disposables.push(this._onBeforeDispose);
			this._disposables.push(this._onDisposeError);
			for (const cb of this._disposables) {
				try {
					await cb.dispose();
				} catch (e) {
					this._onDisposeError.fire(e);
				}
			}
		}
	}
}
