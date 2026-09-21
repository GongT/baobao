import { TimeoutError } from '@idlebox/errors';
import { createStackTraceHolder } from '../error/stack-trace.js';
import { isNodeJs } from '../platform/os.js';

/**
 * @param unref 默认值为 `false`，当为 `true` 时，会在定时器上调用 `unref()`。
 *            其他平台不能设置为 `true`（除非也支持 setTimeout().unref()）。
 * @param boundary 用于创建堆栈跟踪的边界函数
 * @returns promise 在指定时间后以 {TimeoutError} reject
 */
export function timeout(ms: number, error?: string, boundary?: Function, unref?: boolean): Promise<never>;
export function timeout(ms: number, error: string = 'no response', boundary: Function = timeout, unref = false): Promise<never> {
	const s = createStackTraceHolder('', boundary);

	const { reject, promise } = Promise.withResolvers<never>();
	const timer = setTimeout(() => {
		reject(new TimeoutError(ms, error, s));
	}, ms);
	if (unref) (timer as any).unref();

	return promise;
}

/**
 * @param unref 默认值为 `false`，当为 `true` 时，会在定时器上调用 `unref()`。
 *            其他平台不能设置为 `true`。
 * @returns promise 在指定时间后 resolve
 */
export function sleep(ms: number, unref = false): Promise<void> {
	const { resolve, promise } = Promise.withResolvers<void>();

	const timer = setTimeout(() => {
		resolve();
	}, ms);
	if (unref) (timer as any).unref();

	return promise;
}

/**
 * 对一个 Promise 设置超时限制，注意这不会取消 Promise 本身的异步行为
 *
 * @param ms 超时时间，单位为毫秒
 * @param message 当发生超时时使用的错误信息（error.message）
 * @param p 要包裹的 Promise
 * @throws TimeoutError 当超时发生时，reject此错误
 */
export function raceTimeout<T>(ms: number, p: PromiseLike<T>): Promise<T>;
export function raceTimeout<T>(ms: number, message: string, p: PromiseLike<T>): Promise<T>;
export function raceTimeout<T>(ms: number, message_or_p: string | PromiseLike<T>, p?: PromiseLike<T>): Promise<T> {
	if (p) {
		return Promise.race([p, timeout(ms, message_or_p as string, raceTimeout, isNodeJs)]);
	} else {
		return Promise.race([message_or_p as PromiseLike<T>, timeout(ms, undefined, raceTimeout, isNodeJs)]);
	}
}

/**
 * 注意: 多次重试会并行，比如第一次重试过程中，首次发送的请求突然成功了（或失败了），那么会直接返回成功结果。重试的请求即使也成功了，也会被丢弃。
 * 因此建议重试的请求本身具有幂等性（如各种数据下载请求），或者自身无超时机制（如简单的锁）。
 *
 * @param ms 超时时间，单位为毫秒
 * @param retry 重试次数
 * @param factory 发起请求的函数
 * @throws TimeoutError 当所有重试均超时时抛出此错误
 */
export async function raceTimeoutWithRetry<T>(ms: number, retry: number, factory: () => Promise<T>): Promise<T> {
	const ps: PromiseLike<T>[] = [];

	for (let i = 0; i < retry; i++) {
		const p = factory();
		ps.push(p);

		try {
			return await raceTimeout(ms, Promise.race(ps));
		} catch (err) {
			if (err instanceof TimeoutError === false) {
				throw err;
			}

			// continue to retry only when TimeoutError
		}
	}

	throw new TimeoutError(ms * retry, `所有的 ${retry} 次重试全部超时`);
}
