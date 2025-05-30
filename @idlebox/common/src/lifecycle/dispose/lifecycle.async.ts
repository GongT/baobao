import type debug from "debug";
import { convertCatchedError } from "../../error/convertUnknown.js";
import { Emitter, type EventRegister } from "../event/event.js";
import { _debug_dispose, dispose_name } from "./debug.js";
import { DisposedError } from "./disposedError.js";
import type { IAsyncDisposable, IDisposableEvents } from "./lifecycle.js";

/**
 * Async version of Disposable
 * @public
 */
export class AsyncDisposable implements IAsyncDisposable, IDisposableEvents {
	private readonly _disposables: IAsyncDisposable[] = [];

	protected readonly _onDisposeError = new Emitter<Error>();
	public readonly onDisposeError: EventRegister<Error> =
		this._onDisposeError.register;

	protected readonly _onBeforeDispose = new Emitter<void>();
	public readonly onBeforeDispose: EventRegister<void> =
		this._onBeforeDispose.register;

	private _disposed?: Error;
	public readonly displayName?: string;

	/** @internal */
	readonly #logger: debug.Debugger;

	constructor(displayName?: string) {
		if (displayName !== undefined) {
			this.displayName = displayName;
		} else if (!this.displayName) {
			displayName = dispose_name(this, "AsyncDisposable");
			this.displayName = displayName;
		}

		this.#logger = _debug_dispose.extend(this.displayName);
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
	public _register<T extends IAsyncDisposable>(d: T): T;
	public _register<T extends IAsyncDisposable & IDisposableEvents>(
		d: T,
		autoDereference?: boolean,
	): T;
	public _register<
		T extends IAsyncDisposable | (IAsyncDisposable & IDisposableEvents),
	>(d: T, deref?: boolean): T {
		if (this.#logger.enabled) this.#logger(`register ${dispose_name(d)}`);
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
		if (this.#logger.enabled) this.#logger(`unregister ${dispose_name(d)}`);
		return this._disposables.splice(this._disposables.indexOf(d), 1).length > 0;
	}

	public async dispose(): Promise<void> {
		if (this._disposed) {
			console.warn(new DisposedError(this, this._disposed).message);
			return;
		}
		this._onBeforeDispose.fireNoError();
		this._disposed = new Error("disposed");

		this._disposables.push(this._onBeforeDispose);
		this._disposables.push(this._onDisposeError);
		for (const cb of this._disposables) {
			try {
				if (this.#logger.enabled) this.#logger(`dispose ${dispose_name(cb)}`);
				await cb.dispose();
			} catch (e) {
				this._onDisposeError.fire(convertCatchedError(e));
			}
		}
	}
}
