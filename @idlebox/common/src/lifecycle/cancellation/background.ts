import { CancellationTokenImpl, type CancellationToken } from './source.js';

/**
 * 等待promise，或在abortSignal触发时提前返回（通过throw CancelledError）
 *
 * 注意这并不会取消原始的promise，只是提前返回，异步操作仍会继续执行下去，且不会抛出异常
 *
 * 如果可能尽量不要用这个函数
 */
export async function background<T>(promise: Promise<T>, abortSignal?: CancellationToken | AbortSignal): Promise<T> {
	if (!abortSignal) return promise;

	using abortPromise = abortSignalPromise(abortSignal);

	await Promise.race([promise, abortPromise]);

	// 没有触发abort，一定是promise已经完成了，此处await获取结果

	return await promise;
}

/**
 * 将 AbortSignal 转换为一个可回收的 Promise。
 * 如果 AbortSignal 被触发，Promise 将 reject。
 * 调用 dispose ，Promise将 resolve。
 */
export function abortSignalPromise(token: AbortSignal | CancellationToken | undefined): Promise<void> & Disposable {
	if (token) {
		const impl = isImpl(token) ? new CancellationTokenImpl(token.abort) : new CancellationTokenImpl(token);
		return Object.assign(impl.promise, { [Symbol.dispose]: () => impl.dispose() });
	} else {
		const { promise, resolve } = Promise.withResolvers<void>();
		return Object.assign(promise, { [Symbol.dispose]: resolve });
	}
}

function isImpl(token: AbortSignal | CancellationToken): token is CancellationToken {
	return (token as CancellationToken).abort?.addEventListener !== undefined;
}
