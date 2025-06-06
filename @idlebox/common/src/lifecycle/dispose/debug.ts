import debug from 'debug';
import type { IAsyncDisposable, IDisposable } from './lifecycle.js';

/** @internal */
export const _debug_dispose = debug('dispose');

/** @internal */
export function dispose_name(dis: IDisposable | IAsyncDisposable, defaultName = '<unknown>'): string {
	return dis.displayName || dis.name || name_of_func(dis.constructor) || name_of_func(dis.dispose) || defaultName;
}
function name_of_func(obj: any) {
	const name: string = obj.name;

	if (
		name === 'Object' ||
		name === 'Function' ||
		name === 'AsyncFunction' ||
		name === 'GeneratorFunction' ||
		name === 'AsyncGeneratorFunction' ||
		name === 'Disposable' ||
		name === 'AsyncDisposable' ||
		name.toLowerCase() === 'dispose'
	) {
		return '';
	}

	return name;
}
