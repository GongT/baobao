import { convertCaughtError } from '../../error/convert-unknown.js';
import { dispose_name } from './debug.js';
import { AbstractEnhancedDisposable, type IAsyncDisposable } from './disposable.js';

/**
 * 完整版disposable类
 * 可以继承
 * 也可以直接用（相当于一个DisposableStack）
 *
 * 抛出异常的行为会延迟到所有资源都尝试释放完毕之后，因此显然只会抛出其中一个异常给dispose()的调用者
 * 每一个资源释放失败，都会分别触发onDisposeError事件，如果此事件存在监听器，则最后不会抛出异常（处非监听器本身重新抛出）
 * 不支持在dispose过程中添加onError事件监听器
 *
 * @public
 */
export class EnhancedAsyncDisposable extends AbstractEnhancedDisposable<true> implements IAsyncDisposable {
	protected override async _dispose(disposables: readonly IAsyncDisposable[]): Promise<void> {
		const hasListener = this._onDisposeError.listenerCount() > 0;

		let lastError = null;
		for (const d of disposables) {
			try {
				if (this._logger.enabled) this._logger(`dispose ${dispose_name(d)}`);
				await d.dispose();
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

	[Symbol.asyncDispose] = this.dispose;
}

/**
 * 和EnhancedAsyncDisposable相同，但是同时释放所有资源
 * 并且忽略任何错误
 *
 * @public
 */
export class UnorderedAsyncDisposable extends EnhancedAsyncDisposable {
	protected override async _dispose(disposables: readonly IAsyncDisposable[]) {
		const ps = disposables.map(async (d) => {
			try {
				if (this._logger.enabled) this._logger(`dispose ${dispose_name(d)}`);
				await d.dispose();
			} catch (e) {
				this._onDisposeError.fireNoError(convertCaughtError(e));
			}
		});

		await Promise.allSettled(ps);
	}
}
