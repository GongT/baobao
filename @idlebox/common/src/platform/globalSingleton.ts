/** biome-ignore-all lint/suspicious/noShadowRestrictedNames:  */

import { functionName } from '../function/functionName.js';
import { ensureGlobalObject } from './globalObject.js';

const singletonRegistry = ensureGlobalObject('@@idlebox/global-singleton', () => {
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
	let object = singletonRegistry.get(symbol);
	if (object instanceof WeakRef) {
		const target = object.deref();
		if (target !== undefined) {
			object = target;
		} else if (constructor) {
			object = constructor();
			if (object === undefined)
				throw new TypeError(`singleton constructor (${functionName(constructor)}) returned undefined.`);
		} else {
			throw new TypeError(`singleton (${String(symbol)}) is not defined and no constructor provided.`);
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
