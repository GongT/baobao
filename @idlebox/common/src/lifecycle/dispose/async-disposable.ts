import { convertCaughtError } from '../../autoindex.js';
import { dispose_name } from './debug.js';
import { AbstractEnhancedDisposable, type IAsyncDisposable } from './disposable.js';

/**
 * Async version of Disposable
 * @public
 */
export class EnhancedAsyncDisposable extends AbstractEnhancedDisposable<true> implements IAsyncDisposable {
	protected override async _dispose(disposables: readonly IAsyncDisposable[]): Promise<void> {
		for (const d of disposables) {
			try {
				if (this._logger.enabled) this._logger(`dispose ${dispose_name(d)}`);
				await d.dispose();
			} catch (e) {
				this._onDisposeError.fireNoError(convertCaughtError(e));
			}
		}
	}

	[Symbol.asyncDispose] = this.dispose;
}

/**
 * Disposable everything in same time
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
