import { isProductionMode, objectName, type IDisposable } from '@idlebox/common';

export type AnyDisposable = Disposable | AsyncDisposable | IDisposable;

/**
 * disposable 对象转换为 react cleanup 函数
 */
export function toCleanup(obj: AnyDisposable) {
	if (!isProductionMode) {
		if (!isValid(obj)) {
			throw new Error(`对象不可释放: ${objectName(obj)}`);
		}
	}

	return () => {
		dispose(obj);
	};
}

function dispose(obj: any) {
	if (obj['dispose']) {
		return obj.dispose();
	} else if (obj[Symbol.asyncDispose]) {
		return obj[Symbol.asyncDispose]();
	} else if (obj[Symbol.dispose]) {
		return obj[Symbol.dispose]();
	} else {
		throw new Error(`对象不可释放 ${objectName(obj)}`);
	}
}

function isValid(obj: any): obj is AnyDisposable {
	return obj && (obj['dispose'] || obj[Symbol.asyncDispose] || obj[Symbol.dispose]);
}
