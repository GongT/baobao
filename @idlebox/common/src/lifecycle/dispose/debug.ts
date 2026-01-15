import debug from 'debug';
import type { IAsyncDisposable, IDisposable } from './disposable.js';

/** @internal */
export const _debug_dispose = debug('dispose');

/** @internal */
export function dispose_name(disposable: IDisposable | IAsyncDisposable | AsyncDisposable | Disposable, defaultName = '<unknown>'): string {
	const dis = disposable as any;
	return (
		dis.displayName ||
		dis.name ||
		name_of_func(dis.constructor) ||
		name_of_func(dis.dispose) ||
		name_of_func(dis[Symbol.dispose]) ||
		name_of_func(dis[Symbol.asyncDispose]) ||
		defaultName
	);
}
function name_of_func(obj: any) {
	if (!obj) return;
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
