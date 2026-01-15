import type { IAsyncDisposable, IDisposable } from '../disposable.js';

/**
 * 把原生的Disposable/AsyncDisposable对象转换为本包可以使用的版本
 * 注意：返回的是同一个对象
 */
export function fromNativeDisposable<T extends AsyncDisposable>(disposable: T): T & IAsyncDisposable;
export function fromNativeDisposable<T extends Disposable>(disposable: T): T & IDisposable;
export function fromNativeDisposable<T extends AsyncDisposable | Disposable>(disposable: T): T & IAsyncDisposable & IDisposable;
export function fromNativeDisposable(disposable: any): any {
	if (!('dispose' in disposable)) {
		Object.assign(disposable, { dispose: disposable[Symbol.asyncDispose] ?? disposable[Symbol.dispose] });
	}
	return disposable as any;
}

export function toNativeDisposable(disposable: IAsyncDisposable): AsyncDisposable;
export function toNativeDisposable(disposable: IDisposable): Disposable;
export function toNativeDisposable(disposable: any): any {
	if (!('dispose' in disposable)) {
		Object.assign(disposable, { dispose: disposable[Symbol.asyncDispose] ?? disposable[Symbol.dispose] });
	}
	return disposable as any;
}
