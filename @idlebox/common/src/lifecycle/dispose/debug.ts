import debug from 'debug';
import type { IDisposable } from './lifecycle.js';

/** @internal */
export const _debug_dispose = debug('dispose');

/** @internal */
export function dispose_name(dis: IDisposable) {
	return dis.displayName || dis.name || name_of_func(dis.constructor) || name_of_func(dis.dispose) || '<unknown>';
}
function name_of_func(obj: any) {
	const name = obj.name;

	if (
		name === 'Object' ||
		name === 'Function' ||
		name === 'AsyncFunction' ||
		name === 'GeneratorFunction' ||
		name === 'AsyncGeneratorFunction' ||
		name === 'Disposable' ||
		name === 'AsyncDisposable'
	) {
		return '';
	}

	return name;
}
