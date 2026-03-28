// 本文件不可以import任何东西

export const globalObject: any = globalThis;

export function ensureGlobalObject<T>(symbol: string, constructor: () => T): T {
	const sm = Symbol.for(symbol);
	if (!Object.hasOwn(globalObject, sm)) {
		Object.defineProperty(globalObject, sm, {
			value: constructor(),
			enumerable: false,
			writable: false,
			configurable: false,
		});
	}
	return globalObject[sm];
}

export const earlyLoaderState = ensureGlobalObject('early-loader-state', () => {
	return {
		hookEntry: '',
		mainEntry: '',
		exports: null as unknown as typeof import('../index.js'),
		instance: undefined as any,
	};
});
