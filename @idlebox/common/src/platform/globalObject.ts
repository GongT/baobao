declare const global: any;
declare const window: any;

/**
 * window in browser, global in nodejs
 * @public
 */
export const globalObject: any = typeof window === 'undefined' ? global : window;
const globalRegistrySymbol = Symbol.for(`@@idlebox/global-symbol`);
/**
 * Get a symbol from window/global object, if not exists, create it
 *
 * this is very like Symbol.for, but not real global symbol
 * @public
 */
export function createSymbol(category: string, name: string): symbol {
	if (!globalObject[globalRegistrySymbol]) {
		globalObject[globalRegistrySymbol] = {};
	}
	const symbolRegistry = globalObject[globalRegistrySymbol];
	if (symbolRegistry[category] && symbolRegistry[category][name]) {
		return symbolRegistry[category][name];
	} else {
		if (!symbolRegistry[category]) {
			symbolRegistry[category] = {};
		}
		return (symbolRegistry[category][name] = Symbol(name));
	}
}

function dontCreate(): any {
	return undefined;
}

/**
 * Get an singleton instance from window/global space
 * if symbol did not exists, create it and assign to window/global
 * @public
 */
export function globalSingletonStrong<T>(symbol: symbol, constructor: () => T): T;
/**
 * Get an singleton instance from window/global space
 * @public
 */
export function globalSingletonStrong<T>(symbol: symbol): T | undefined;

export function globalSingletonStrong<T>(symbol: symbol, constructor: () => T = dontCreate): T {
	if (!globalObject[symbol]) {
		globalObject[symbol] = constructor();
	}
	return globalObject[symbol];
}

/**
 * Delete a key from window/global space
 * use with care
 * @public
 */
export function globalSingletonDelete(symbol: symbol | string) {
	if (globalObject[symbol]) {
		delete globalObject[symbol];
	}
}

/**
 * Same with globalSingletonStrong, but save instance in a WeakMap, so it maybe delete by gc if no reference
 * @public
 */
export function globalSingleton<T>(symbol: symbol | string, constructor: () => T): T;
/**
 * Same with globalSingletonStrong, but save instance in a WeakMap, so it maybe delete by gc if no reference
 * @public
 */
export function globalSingleton<T>(symbol: symbol | string): T | undefined;
export function globalSingleton<T>(symbol: symbol | string, constructor: () => T = dontCreate): T {
	if (!globalObject.referrence) {
		globalObject.referrence = new WeakMap();
	}
	let ref: T;
	if (globalObject.referrence.has(symbol)) {
		ref = globalObject.referrence.get(symbol);
	} else {
		ref = constructor();
		globalObject.referrence.set(symbol);
	}
	return ref;
}
