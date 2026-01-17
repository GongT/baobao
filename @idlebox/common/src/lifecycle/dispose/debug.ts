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

let expand_note = '';
if (!_debug_dispose.enabled) {
	expand_note = ` (show trace with DEBUG=${_debug_dispose.namespace})`;
}

const holderSymbol = Symbol('disposable.holder');
const rm_logger = _debug_dispose.extend('rememberParent');
rm_logger.enabled = true;
/** @internal */
export function rememberParent(child: any, parent: IDisposable | IAsyncDisposable) {
	if (Object.hasOwn(child, holderSymbol)) {
		rm_logger(
			`WARN: disposable object duplicate registing.${expand_note}\n   * object: ${dispose_name(child)}\n   * current parent: ${dispose_name(child[holderSymbol])}\n   * new parent: ${dispose_name(parent)}`,
		);
		if (_debug_dispose.enabled) _trace_3();
	} else {
		Object.defineProperty(child, holderSymbol, { value: parent, configurable: true, enumerable: false, writable: false });
	}
}
/** @internal */
export function forgetParent(child: any, ensure_parent: IDisposable | IAsyncDisposable) {
	if (Object.hasOwn(child, holderSymbol)) {
		if (child[holderSymbol] === ensure_parent) {
			delete child[holderSymbol];
			return;
		}
		rm_logger(
			`WARN: disposable object unregister from wrong parent.${expand_note}\n   * object: ${dispose_name(child)}\n   * correct parent: ${dispose_name(child[holderSymbol])}\n   * try unregister from: ${dispose_name(ensure_parent)}`,
		);
		if (_debug_dispose.enabled) _trace_3();
	} else {
		rm_logger(
			`WARN: disposable object unregister but no parent.${expand_note}\n   * object: ${dispose_name(child)}\n   * try unregister from: ${dispose_name(ensure_parent)}`,
		);
		if (_debug_dispose.enabled) _trace_3();
	}
}

function _trace_3() {
	const trace = Object.assign(new Error(''), { name: 'Trace' });
	const arr = trace.stack?.split('\n') ?? [];
	arr.splice(1, 3);
	// 1: _trace_3
	// 2: rememberParent / forgetParent
	// 3: caller (_register/_unregister)
	console.log(arr.join('\n'));
}
