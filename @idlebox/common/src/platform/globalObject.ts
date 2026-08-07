declare const global: any;
declare const window: any;

/**
 * globalObject === globalThis
 * @public
 */
export const globalObject: any = typeof globalThis === 'undefined' ? (typeof window === 'undefined' ? global : window) : globalThis;

/**
 * 确保全局对象上存在一个值，如果不存在则创建它
 * @public
 */
export function ensureGlobalObject<T>(symbol: string, constructor: () => T): T {
	const sm = Symbol.for(symbol);
	if (!Object.hasOwn(globalObject, sm)) {
		globalObject[sm] = constructor();
	}
	return globalObject[sm];
}

/**
 * 确保全局对象上存在一个值，如果不存在则创建它
 * 如果已经存在，则抛出异常
 * @public
 */
export function ensureGlobalObjectSingleton<T>(symbol: string, constructor: () => T): T {
	const sm = Symbol.for(symbol);
	if (!Object.hasOwn(globalObject, sm)) {
		globalObject[sm] = constructor();
	} else {
		throw new Error(`global object ${symbol} initialized twice`);
	}
	return globalObject[sm];
}
