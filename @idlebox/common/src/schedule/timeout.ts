import { TimeoutError } from '@idlebox/errors';
import { isNodeJs } from '../platform/os.js';

/**
 * @param unref defaults to `false`, when true, call `unref()` on the timer.
 *            can not set to `true` on other platform (will throw "unref is not function" error).
 * @returns promise reject with TimeoutError after specific time
 */
export function timeout(ms: number, error = 'no response', unref = false): Promise<never> {
	return new Promise((_, reject) => {
		const timer = setTimeout(() => {
			reject(new TimeoutError(ms, error));
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

export function raceTimeout<T>(ms: number, p: PromiseLike<T>): PromiseLike<T>;
export function raceTimeout<T>(ms: number, message: string, p: PromiseLike<T>): PromiseLike<T>;

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
		return Promise.race([p, timeout(ms, message_or_p as string, isNodeJs)]);
	} else {
		return Promise.race([message_or_p as PromiseLike<T>, timeout(ms, undefined, isNodeJs)]);
	}
}
