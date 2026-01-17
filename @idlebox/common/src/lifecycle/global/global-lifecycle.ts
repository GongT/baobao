import { globalSingletonStrong } from '../../platform/globalSingleton.js';
import { createSymbol } from '../../platform/globalSymbol.js';
import { UnorderedAsyncDisposable, type EnhancedAsyncDisposable } from '../dispose/async-disposable.js';
import { _debug_dispose } from '../dispose/debug.js';
import type { IAsyncDisposable, IDisposable, IDisposableEvents } from '../dispose/disposable.js';

const symbol = createSymbol('lifecycle', 'application');

function create(): EnhancedAsyncDisposable {
	return new UnorderedAsyncDisposable('global');
}

const logger = _debug_dispose.extend('global');

/**
 * Add object into global disposable store, it will be dispose when call to `disposeGlobal`
 */
export function registerGlobalLifecycle(object: (IDisposable | IAsyncDisposable) & IDisposableEvents, autoDereference: true): void;
export function registerGlobalLifecycle(object: IDisposable | IAsyncDisposable): void;
export function registerGlobalLifecycle(object: IDisposable | IAsyncDisposable, autoDereference?: boolean) {
	globalSingletonStrong(symbol, create)._register(object as any, autoDereference);
}

/**
 * Same as disposeGlobal, but do not throw by duplicate call
 */
export function ensureDisposeGlobal() {
	const obj = globalSingletonStrong<EnhancedAsyncDisposable>(symbol);
	if (obj && !obj.disposed) {
		return Promise.try(() => obj.dispose());
	}
	return Promise.resolve();
}

/**
 * Dispose the global disposable store
 * this function must be manually called by user, when registerGlobalLifecycle is used
 *
 * @throws when call twice
 */
export function disposeGlobal() {
	const obj = globalSingletonStrong<EnhancedAsyncDisposable>(symbol);
	if (obj?.disposed) {
		throw new Error('global already disposed.');
	}
	if (obj) {
		return Promise.try(() => obj.dispose());
	}
	if (logger.enabled) logger(`dispose global (not exists)`);
	return Promise.resolve();
}
