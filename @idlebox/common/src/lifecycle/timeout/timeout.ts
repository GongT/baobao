import { DeferredPromise } from '../promise/deferredPromise.js';
import { TimeoutError } from './timeoutError.js';

/**
 * @param unref defaults to `false`, when true, call `unref()` on the timer.
 *            can not set to `true` on other platform.
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

export function timeoutPromise<T>(ms: number, p: PromiseLike<T> | DeferredPromise<T>): PromiseLike<T>;
export function timeoutPromise<T>(ms: number, message: string, p: PromiseLike<T> | DeferredPromise<T>): PromiseLike<T>;

/**
 * race the promise with timeout
 *
 * @param ms timeout in milliseconds
 * @param message error.message when timeout
 * @param p the promise
 * @returns
 */
export function timeoutPromise<T>(ms: number, message: string | PromiseLike<T> | DeferredPromise<T>, p?: PromiseLike<T> | DeferredPromise<T>): PromiseLike<T> {
	let msg: string | undefined;
	if (typeof message !== 'string') {
		p = message;
		msg = undefined;
	} else {
		msg = message;
	}
	if (p instanceof DeferredPromise) {
		return Promise.race([p.p, timeout(ms, msg)]);
	}
	return Promise.race([p as PromiseLike<T>, timeout(ms, msg)]);
}
