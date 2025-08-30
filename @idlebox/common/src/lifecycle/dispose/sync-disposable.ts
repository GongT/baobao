import { convertCaughtError } from '../../error/convert-unknown.js';
import { createStackTraceHolder, type StackTraceHolder } from '../../error/stack-trace.js';
import { dispose_name } from './debug.js';
import { AbstractEnhancedDisposable, type IDisposable } from './disposable.js';
import { DuplicateDisposed } from './disposedError.js';

/**
 * 简单版手动disposable
 */
export abstract class DisposableOnce implements IDisposable {
	private _disposed?: StackTraceHolder;

	public get hasDisposed() {
		return !!this._disposed;
	}
	public dispose(): void {
		if (this._disposed) {
			console.warn(new DuplicateDisposed(this, this._disposed).message);
			return;
		}
		this._disposed = createStackTraceHolder('disposed', this.dispose);
		this._dispose();
	}
	[Symbol.dispose]() {
		this.dispose();
	}
	protected abstract _dispose(): void;
}

/**
 * 完整版disposable类
 * 可以继承
 * 也可以直接用（相当于一个DisposableStack）
 */
export class EnhancedDisposable extends AbstractEnhancedDisposable<false> implements IDisposable {
	protected override _dispose(disposables: readonly IDisposable[]): void {
		for (const item of disposables.values()) {
			try {
				if (this._logger.enabled) this._logger(`dispose ${dispose_name(item)}`);
				item.dispose();
			} catch (e) {
				const ee = convertCaughtError(e);
				this._onDisposeError.fire(ee);
				if (!this._onDisposeError.listenerCount()) {
					console.error('Unhandled error during dispose: %s', ee.stack);
				}
			}
		}
	}

	/// compitable with stack
	public [Symbol.dispose] = this.dispose;
}
