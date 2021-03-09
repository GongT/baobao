declare const global: any;
declare const window: any;

/**
 * window in browser, global in nodejs
 * @public
 */
export const globalObject: any =
	typeof globalThis === 'undefined' ? (typeof window === 'undefined' ? global : window) : globalThis;

const globalRegistrySymbol = Symbol.for(`@@idlebox/global-symbol`);

const weakRef = createSymbol('idlebox-internal', 'weakref');

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

export function deleteSymbol(category: string, name: string) {
	if (!globalObject[globalRegistrySymbol]) {
		return;
	}
	const symbolRegistry = globalObject[globalRegistrySymbol];
	if (symbolRegistry[category] && symbolRegistry[category][name]) {
		delete symbolRegistry[category][name];
		if (Object.keys(symbolRegistry[category]).length === 0) {
			delete symbolRegistry[category];
		}
	}
}

/**
 * Get an singleton instance from window/global space
 * if symbol did not exists, create it and assign to window/global
 * @public
 */
export function globalSingletonStrong<T>(symbol: symbol | string, constructor: () => T): T;
/**
 * Get an singleton instance from window/global space
 * @public
 */
export function globalSingletonStrong<T>(symbol: symbol | string): T | undefined;

export function globalSingletonStrong<T>(symbol: symbol | string, constructor?: () => T): T {
	if (!globalObject[symbol] && constructor) {
		globalObject[symbol] = constructor();
	}
	if (globalObject[symbol][weakRef]) {
		return globalObject.referrence.get(globalObject[symbol]);
	} else {
		return globalObject[symbol];
	}
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
export function globalSingleton<T>(symbol: symbol | string, constructor?: () => T): T | undefined {
	if (globalObject[symbol]) {
		return globalObject[symbol];
	}

	globalObject[symbol] = { [weakRef]: symbol };
	const key: object = globalObject[symbol];

	if (!globalObject.referrence) {
		globalObject.referrence = new WeakMap();
	}
	const referrence: WeakMap<any, T> = globalObject.referrence;

	let ref: T | undefined;
	if (referrence.has(key)) {
		ref = referrence.get(key);
	} else if (constructor) {
		ref = constructor();
		referrence.set(key, ref);
	} else {
		delete globalObject[symbol];
	}
	return ref;
}
