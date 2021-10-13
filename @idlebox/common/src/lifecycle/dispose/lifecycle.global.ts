import { globalSingletonStrong } from '../../platform/globalSingleton';
import { createSymbol } from '../../platform/globalSymbol';
import { IDisposable } from './lifecycle';
import { AsyncDisposable } from './lifecycle.async';

const symbol = createSymbol('lifecycle', 'application');

function create() {
	return new AsyncDisposable();
}

/**
 * Add object into global disposable store, it will be dispose when call to `disposeGlobal`
 */
export function registerGlobalLifecycle(object: IDisposable) {
	globalSingletonStrong(symbol, create)._register(object);
}

/**
 * Same as disposeGlobal, but do not throw by duplicate call
 */
export function ensureDisposeGlobal() {
	const obj = globalSingletonStrong<AsyncDisposable>(symbol);
	if (obj && !obj.hasDisposed) {
		return Promise.resolve(obj.dispose());
	} else {
		return Promise.resolve();
	}
}

/**
 * Dispose the global disposable store
 * this function must be manually called by user, when registerGlobalLifecycle is used
 *
 * @throws when call twice
 */
export function disposeGlobal() {
	const obj = globalSingletonStrong<AsyncDisposable>(symbol);
	if (obj && obj.hasDisposed) {
		throw new Error('global already disposed.');
	} else if (obj) {
		return Promise.resolve(obj.dispose());
	} else {
		return Promise.resolve();
	}
}

/**
 * Note: sub-class should singleton
 * @alpha
 */
export abstract class LifecycleObject extends AsyncDisposable {
	/** sub-class should shutdown program in this method */
	protected abstract done(): void;

	public async dispose(): Promise<void> {
		return super.dispose().finally(() => {
			this.done();
		});
	}
}
