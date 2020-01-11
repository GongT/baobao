declare const global: any;
declare const window: any;

export const globalObject: any = typeof window === 'undefined' ? global : window;
const globalRegistrySymbol = Symbol.for(`@@idlebox/global-symbol`);

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
		return symbolRegistry[category][name] = Symbol(name);
	}
}

function dontCreate(): any {
	return undefined;
}

export function globalSingletonStrong<T>(symbol: symbol, constructor: () => T): T;
export function globalSingletonStrong<T>(symbol: symbol): T | undefined;
export function globalSingletonStrong<T>(symbol: symbol, constructor: () => T = dontCreate): T {
	if (!globalObject[symbol]) {
		globalObject[symbol] = constructor();
	}
	return globalObject[symbol];
}

export function globalSingletonDelete(symbol: symbol | string) {
	if (globalObject[symbol]) {
		delete globalObject[symbol];
	}
}

export function globalSingleton<T>(symbol: symbol | string, constructor: () => T): T;
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
