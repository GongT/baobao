import { setSourceMapsEnabled } from 'node:process';

export const symbol = Symbol.for('native-executer');

if (process.env.DEBUG_DUPLICATE_INSTANCE !== undefined) setSourceMapsEnabled(false);

// 确保这个文件只加载一次
const ss: ILoaderState = (globalThis as any)[symbol];
if (ss) {
	console.error('native-executer: 加载器重复导入');
	console.error('  * argv:', process.argv);
	console.error('  * cwd:', process.cwd());
	console.error('  * execArgv:', process.execArgv);

	if (process.env.DEBUG_DUPLICATE_INSTANCE !== undefined) {
		const stack = ss.stackHold?.stack;
		console.error('\x1B[38;5;9m[首次初始化]\x1B[0m');
		console.error(s(stack) || '缺少首次初始化stack，未知版本');

		console.error('\x1B[38;5;9m[本次栈信息]\x1B[0m');
		console.error(s(new Error('本次初始化').stack) || '无法获取本次栈信息');
	} else {
		console.error('设置 DEBUG_DUPLICATE_INSTANCE=1 添加一个stack trace');
	}
}

function s(stack?: string) {
	return stack?.split('\n').slice(1).join('\n');
}

export interface ILoaderState {
	dispose(): void;
	loaded?: Set<string>;
	overrides?: Map<string, string>;
	stackHold?: Error;
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
	object.stackHold = new Error('首次初始化');
}

export const theState = object;
