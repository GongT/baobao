import { functionName } from '../debugging/object-with-name.js';
import { ensureGlobalObject } from './globalObject.js';

const singletonRegistry = ensureGlobalObject('@@idlebox/global-singleton', () => {
	return new Map<string | symbol, any>();
});

/**
 * 获取一个全局单例对象，如果不存在则创建它并赋值到globalThis上。
 * @public
 */
export function globalSingletonStrong<T>(symbol: symbol | string, constructor: () => T): T;
/**
 * 获取一个全局单例对象，如果不存在则返回undefined。
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
			if (object === undefined) throw new TypeError(`singleton constructor (${functionName(constructor)}) returned undefined.`);
		} else {
			throw new TypeError(`singleton (${String(symbol)}) is not defined and no constructor provided.`);
		}
		singletonRegistry.set(symbol, object);
	} else if (object === undefined && constructor) {
		object = constructor();
		if (object === undefined) throw new TypeError(`singleton constructor (${functionName(constructor)}) returned undefined.`);
		singletonRegistry.set(symbol, object);
	}
	return object;
}

/**
 * 删除一个全局单例对象
 * @public
 */
export function globalSingletonDelete(symbol: symbol | string) {
	singletonRegistry.delete(symbol);
}

export function globalSingleton<T>(symbol: symbol | string, constructor: () => T): T;
export function globalSingleton<T>(symbol: symbol | string): T | undefined;
/**
 * 与globalSingletonStrong相同，但将实例保存在弱引用中，如果没有强引用，它有可能会被垃圾回收删除。
 * @public
 */
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
