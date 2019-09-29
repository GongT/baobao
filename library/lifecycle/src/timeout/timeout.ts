import { TimeoutError } from './timeoutError';
import { DeferredPromise } from '../promise/deferredPromise';

export function timeout(ms: number, error = 'no response'): Promise<never> {
	return new Promise((_, reject) => {
		setTimeout(() => {
			reject(new TimeoutError(ms, error));
		}, ms);
	});
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

export function timeoutPromise<T>(ms: number, p: Promise<T>): Promise<T>;
export function timeoutPromise<T>(ms: number, message: string, p: Promise<T>): Promise<T>;
export function timeoutPromise<T, PT = any>(ms: number, p: DeferredPromise<T, PT>): DeferredPromise<T, PT>;
export function timeoutPromise<T, PT = any>(ms: number, message: string, p: DeferredPromise<T, PT>): DeferredPromise<T, PT>;

export function timeoutPromise<T>(ms: number, message: string | T, p?: T): T {
	let msg: string | undefined;
	if (typeof message !== 'string') {
		p = message;
		msg = undefined;
	} else {
		msg = message;
	}
	if (p instanceof DeferredPromise) {
		return Promise.race([p.p, timeout(ms, msg)]).then(() => p) as any;
	} else {
		return Promise.race([p, timeout(ms, msg)]).then(() => p) as any;
	}
}
