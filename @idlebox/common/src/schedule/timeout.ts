import { TimeoutError } from '@idlebox/errors';
import { createStackTraceHolder } from '../error/stack-trace.js';
import { isNodeJs } from '../platform/os.js';

/**
 * @param unref defaults to `false`, when true, call `unref()` on the timer.
 *            can not set to `true` on other platform (will throw "unref is not function" error).
 * @returns promise reject with TimeoutError after specific time
 */
export function timeout(ms: number, error?: string, boundary?: Function, unref?: boolean): Promise<never>;
export function timeout(ms: number, error: string = 'no response', boundary: Function = timeout, unref = false): Promise<never> {
	const s = createStackTraceHolder('', boundary);

	return new Promise((_, reject) => {
		const timer = setTimeout(() => {
			reject(new TimeoutError(ms, error, s));
		}, ms);
		if (unref) (timer as any).unref();
	});
}

/**
 * @param unref defaults to `false`, when true, call `unref()` on the timer.
 *            can not set to `true` on other platform.
 * @returns promise resolve after specific time
 */
export function sleep(ms: number, unref = false): Promise<void> {
	return new Promise((resolve) => {
		const timer = setTimeout(() => {
			resolve();
		}, ms);
		if (unref) (timer as any).unref();
	});
}

export function raceTimeout<T>(ms: number, p: PromiseLike<T>): Promise<T>;
export function raceTimeout<T>(ms: number, message: string, p: PromiseLike<T>): Promise<T>;

/**
 * race the promise with timeout
 *
 * @param ms timeout in milliseconds
 * @param message error.message when timeout
 * @param p the promise
 * @returns
 */
export function raceTimeout<T>(ms: number, message_or_p: string | PromiseLike<T>, p?: PromiseLike<T>): Promise<T> {
	if (p) {
		return Promise.race([p, timeout(ms, message_or_p as string, raceTimeout, isNodeJs)]);
	} else {
		return Promise.race([message_or_p as PromiseLike<T>, timeout(ms, undefined, raceTimeout, isNodeJs)]);
	}
}

/**
 * 注意: 多次重试会并行，比如第一次重试过程中，首次发送的请求突然成功了（或失败了），那么会直接返回成功结果，第一次重试的请求即使也成功了，也会被丢弃。
 * 因此建议重试的请求本身具有幂等性（如各种数据下载请求），或者自身无超时机制（如简单的锁）。
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

	throw new TimeoutError(ms * retry, `All ${retry} retries timed out`);
}
