import { functionName, nameObject } from '../../../debugging/object-with-name.js';
import { dispose_name } from '../debug.js';
import type { IAsyncDisposable, IDisposable } from '../disposable.js';

/**
 * Convert "dispose function" to disposable object
 * @public
 */
export function functionToDisposable<RT>(fn: () => RT): RT extends Promise<any> ? IAsyncDisposable : IDisposable {
	return {
		get displayName() {
			return `disposeFn(${functionName(fn)})`;
		},
		dispose: fn,
	} as any;
}

/**
 * convert disposable object to function
 * eg.
 *
 * useEffect(() => {
 * 	const disposable = new Xyz();
 * 	return toFunction(disposable);
 * }, [])
 */
export function disposerFunction<T extends IDisposable | IAsyncDisposable>(obj: T): T extends IAsyncDisposable ? () => Promise<void> : () => void {
	return nameObject(dispose_name(obj), () => {
		obj.dispose();
	}) as any;
}
