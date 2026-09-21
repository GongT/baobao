export type MaybePromise<T = void> = T | PromiseLike<T>;
export type AsyncFunction<TArgs extends any[] = any[], TResult = void> = (...args: TArgs) => MaybePromise<TResult>;

export function isPromiseLike(object: unknown): object is PromiseLike<unknown> {
	return typeof object === 'object' && object !== null && typeof (object as any).then === 'function';
}
