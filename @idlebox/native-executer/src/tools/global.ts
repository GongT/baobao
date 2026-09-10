export const symbol = Symbol.for('native-executer');

// 确保这个文件只加载一次
if (Object.hasOwn(globalThis, symbol)) {
	console.error('native-executer: 加载器重复导入');
	if (process.env.DEBUG_DUPLICATE_INSTANCE !== undefined) {
		console.error((globalThis as any)[symbol].stack ?? '缺少stack，未知版本');
	} else {
		console.error('设置 DEBUG_DUPLICATE_INSTANCE=1 添加一个stack trace');
	}
}

export interface ILoaderState {
	dispose(): void;
	loaded?: Set<string>;
	overrides?: Map<string, string>;
	stack?: Error;
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
if (process.env.DEBUG_DUPLICATE_INSTANCE !== undefined) {
	object.stack = new Error('首次初始化');
}

export const theState = object;
