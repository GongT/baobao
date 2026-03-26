export function isPromiseLike(object: unknown): object is PromiseLike<unknown> {
	return typeof object === 'object' && object !== null && typeof (object as any).then === 'function';
}
