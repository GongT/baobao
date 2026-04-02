import assert from 'node:assert';
export const symbol = Symbol.for('native-executer');

// 确保这个文件只加载一次
assert.ok(!Object.hasOwn(globalThis, symbol), 'Loader hooks have already been installed');

export interface ILoaderState {
	dispose(): void;
	loaded?: Set<string>;
	overrides?: Map<string, string>;
}

const object: ILoaderState = {
	dispose() {
		if (object.loaded) {
			object.loaded.clear();
		}
		if (object.overrides) {
			object.overrides.clear();
		}
	},
};
Object.defineProperty(globalThis, symbol, {
	value: object,
	enumerable: false,
	writable: false,
	configurable: false,
});

if (process.env.NATIVE_EXECUTER_COLLECTION !== undefined) {
	object.loaded = new Set();
}

export const theState = object;
