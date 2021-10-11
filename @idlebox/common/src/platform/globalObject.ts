import { functionName } from '../function/functionName';

declare const global: any;
declare const window: any;

/**
 * globalThis when supported.
 * if not, window in browser, global in nodejs
 * @public
 */
export const globalObject: any =
	typeof globalThis === 'undefined' ? (typeof window === 'undefined' ? global : window) : globalThis;

function ensureGlobalObject<T>(symbol: string, constructor: () => T): T {
	const sm = Symbol.for(symbol);
	if (!globalObject[sm]) {
		globalObject[sm] = constructor();
	}
	return globalObject[sm];
}

const symbolRegistry = ensureGlobalObject(`@@idlebox/global-symbol`, () => {
	return {} as Record<string, Record<string, symbol>>;
});

/**
 * Get a symbol singleton, if not exists, create it
 *
 * this is very like Symbol.for, but not real global symbol
 * @public
 */
export function createSymbol(category: string, name: string): symbol {
	if (symbolRegistry[category] && symbolRegistry[category][name]) {
		return symbolRegistry[category][name];
	} else {
		if (!symbolRegistry[category]) {
			symbolRegistry[category] = {};
		}
		symbolRegistry[category][name] = Symbol(name);
		return symbolRegistry[category][name];
	}
}

/**
 * Delete a symbol from window/global object
 * @public
 */
export function deleteSymbol(category: string, name: string) {
	if (symbolRegistry[category] && symbolRegistry[category][name]) {
		delete symbolRegistry[category][name];
		if (Object.keys(symbolRegistry[category]).length === 0) {
			delete symbolRegistry[category];
		}
	}
}

const singletonRegistry = ensureGlobalObject(`@@idlebox/global-singleton`, () => {
	return new Map<string | symbol, any>();
});

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

export function globalSingletonStrong<T>(symbol: symbol | string, constructor?: () => T): T | undefined {
	let object = globalObject.get(symbol);
	if (object instanceof WeakRef) {
		const target = object.deref();
		if (target !== undefined) {
			object = target;
		} else if (constructor) {
			object = constructor();
			if (object === undefined)
				throw new TypeError(`singleton constructor (${functionName(constructor)}) returned undefined.`);
		} else {
			singletonRegistry.delete(symbol);
			return undefined;
		}
		singletonRegistry.set(symbol, object);
	} else if (object === undefined && constructor) {
		object = constructor();
		if (object === undefined)
			throw new TypeError(`singleton constructor (${functionName(constructor)}) returned undefined.`);
		singletonRegistry.set(symbol, object);
	}
	return object;
}

/**
 * Delete a key from window/global space
 * use with care
 * @public
 */
export function globalSingletonDelete(symbol: symbol | string) {
	singletonRegistry.delete(symbol);
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
	if (singletonRegistry.has(symbol)) {
		let object = singletonRegistry.get(symbol);
		if (object instanceof WeakRef) {
			object = object.deref();
			if (object) return object;
			singletonRegistry.delete(symbol);
		} else {
			return object; // strong
		}
	}

	if (constructor) {
		const object = new WeakRef(constructor() as any);
		singletonRegistry.set(symbol, object);
		return object.deref();
	}

	return undefined;
}
