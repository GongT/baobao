import { DuplicateCallError } from '@idlebox/errors';
import { globalSingletonStrong } from '../../platform/globalSingleton.js';
import { createSymbol } from '../../platform/globalSymbol.js';
import { UnorderedAsyncDisposable, type EnhancedAsyncDisposable } from '../dispose/async-disposable.js';
import { _debug_dispose } from '../dispose/debug.js';
import { DuplicateDisposeAction, type IAsyncDisposable, type IDisposable, type IDisposableEvents } from '../dispose/disposable.js';

/** @internal */
export const globalLifecycleSymbol = createSymbol('lifecycle', 'application');

function create(): EnhancedAsyncDisposable {
	class GlobalLifecycleHost extends UnorderedAsyncDisposable {
		protected override duplicateDispose = DuplicateDisposeAction.Allow;

		public readonly [globalLifecycleSymbol] = true;
	}
	return new GlobalLifecycleHost('global-lifecycle');
}

const logger = _debug_dispose.extend('global');

/**
 * 向全局生命周期注册一个对象，当调用`disposeGlobal`时，该对象会被释放。
 *
 * @param autoDereference 如果为true，则object必须支持释放通知。释放发生时，会自动移除该对象的引用。
 */
export function registerGlobalLifecycle(object: (IDisposable | IAsyncDisposable) & IDisposableEvents, autoDereference: true): void;
export function registerGlobalLifecycle(object: IDisposable | IAsyncDisposable): void;
export function registerGlobalLifecycle(object: IDisposable | IAsyncDisposable, autoDereference?: boolean) {
	globalSingletonStrong(globalLifecycleSymbol, create)._register(object as any, autoDereference);
}

/**
 * 和 `disposeGlobal` 类似，但允许重复调用
 * 重复调用等待全局生命周期释放完成
 */
export function ensureDisposeGlobal() {
	const obj = globalSingletonStrong<EnhancedAsyncDisposable>(globalLifecycleSymbol);
	if (obj) {
		if (obj.disposing) {
			return obj.dispose();
		} else if (!obj.disposed) {
			return Promise.try(() => obj.dispose());
		}
	}
	return Promise.resolve();
}

/**
 * 销毁全局资源存储
 * 当使用了 `registerGlobalLifecycle` 时，用户必须在程序结束前手动调用此函数（或ensureDisposeGlobal）
 *
 * 此函数只能调用一次，之后应立即退出程序，否则可能会出现不可预期的行为。
 *
 * @throws 不能重复调用
 */
export function disposeGlobal() {
	const obj = globalSingletonStrong<EnhancedAsyncDisposable>(globalLifecycleSymbol);
	if (obj?.disposed || obj?.disposing) {
		throw new DuplicateCallError(disposeGlobal);
	}
	if (obj) {
		return Promise.try(() => obj.dispose());
	}
	if (logger.enabled) logger(`dispose global (not exists)`);
	return Promise.resolve();
}
