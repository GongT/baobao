import { convertCaughtError } from '../../error/convert-unknown.js';
import { createStackTraceHolder, type StackTraceHolder } from '../../error/stack-trace.js';
import { dispose_name } from './debug.js';
import { AbstractEnhancedDisposable, type IDisposable } from './disposable.js';
import { DuplicateDisposedError } from './disposedError.js';

/**
 * 简单版手动disposable
 */
export abstract class DisposableOnce implements IDisposable {
	private _disposed?: StackTraceHolder;

	public get disposed() {
		return !!this._disposed;
	}
	public dispose(): void {
		if (this._disposed) {
			const w = new DuplicateDisposedError(this, this._disposed);
			w.consoleWarning();
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
 *
 * 抛出异常的行为会延迟到所有资源都尝试释放完毕之后，因此显然只会抛出其中一个异常给dispose()的调用者
 * 每一个资源释放失败，都会分别触发onDisposeError事件，如果此事件存在监听器，则最后不会抛出异常（处非监听器本身重新抛出）
 * 不支持在dispose过程中添加onError事件监听器
 *
 */
export class EnhancedDisposable extends AbstractEnhancedDisposable<false> implements IDisposable {
	protected override _dispose(disposables: readonly IDisposable[]): void {
		const hasListener = this._onDisposeError.listenerCount() > 0;

		let lastError = null;
		for (const item of disposables.values()) {
			try {
				if (this._logger.enabled) this._logger(`dispose ${dispose_name(item)}`);
				item.dispose();
			} catch (e) {
				if (hasListener) {
					try {
						this._onDisposeError.fire(convertCaughtError(e));
					} catch (e) {
						lastError = e;
					}
				} else {
					lastError = e;
				}
			}
		}

		if (lastError) {
			throw lastError;
		}
	}

	/// compitable with stack
	public [Symbol.dispose] = this.dispose;
}
