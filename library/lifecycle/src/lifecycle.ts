import { DisposedError } from '@idlebox/errors';
import { Emitter, EventRegister } from './event';

export interface IDisposableBase {
	onDisposeError: EventRegister<Error>;
	onBeforeDispose: EventRegister<void>;
	readonly hasDisposed: boolean;
}

export interface IDisposable {
	dispose(): void;
}

export interface IAsyncDisposable {
	dispose(): void | Promise<void>;
}

/** @internal */
export abstract class DisposableBase implements IDisposableBase {
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
}

export class AsyncDisposable extends DisposableBase implements IAsyncDisposable {
	private readonly _disposables: IAsyncDisposable[] = [];

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

export class Disposable extends DisposableBase implements IDisposable {
	private readonly _disposables: IDisposable[] = [];

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

export function toDisposable(fn: () => void): IDisposable {
	return { dispose: fn };
}

// Note: sub-class should singleton
export abstract class LifecycleObject extends AsyncDisposable {
	/** sub-class should shutdown program */
	protected abstract done(): void;

	public async dispose(): Promise<void> {
		return super.dispose().finally(() => {
			this.done();
		});
	}
}
