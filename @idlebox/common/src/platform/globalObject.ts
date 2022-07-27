declare const global: any;
declare const window: any;

/**
 * globalThis when supported.
 * if not, window in browser, global in nodejs
 * @public
 */
export const globalObject: any =
	typeof globalThis === 'undefined' ? (typeof window === 'undefined' ? global : window) : globalThis;

export function ensureGlobalObject<T>(symbol: string, constructor: () => T): T {
	const sm = Symbol.for(symbol);
	if (!globalObject[sm]) {
		globalObject[sm] = constructor();
	}
	return globalObject[sm];
}

export function x() {
	return 1;
}
