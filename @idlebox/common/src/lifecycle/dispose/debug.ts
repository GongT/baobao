import debug from 'debug';
import { createSymbol } from '../../platform/globalSymbol.js';
import type { IAsyncDisposable, IDisposable } from './disposable.js';

/** @internal */
export const _is_global = createSymbol('lifecycle', 'global');

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
	expand_note = ` (设置 DEBUG=${_debug_dispose.namespace} 以显示日志)`;
}

const debugRegistry = new WeakMap<
	any,
	{
		last?: WeakRef<IDisposable | IAsyncDisposable>;
		strong: boolean;
		reference: number;
	}
>();
const rm_logger = _debug_dispose.extend('rememberParent');
rm_logger.enabled = true;

function alertDuplicate(child: any, exists: any, newParent: any) {
	rm_logger(
		`警告: 资源重复注册. ${expand_note}\n   * 资源: ${dispose_name(child)}\n   * 现有容器: ${exists ? dispose_name(exists) : '*已回收*'}\n   * 尝试注册到: ${dispose_name(newParent)}`,
	);
	if (_debug_dispose.enabled) _trace_4();
}

/**
 * @internal
 *
 * 记录父对象引用，方便调试，注册时只警告，实际会不会异常要看dispose实际实现
 * 例如恰好唯一强引用的对象最先释放了，就不会产生异常
 *
 * 此处的“弱引用”是: 当autoDereference为true时，资源释放时会自动从父对象脱离。
 *
 * 一个资源只能:
 * 1. 注册任意多个弱引用
 * 2. 注册一个强引用，不能有其他引用
 */
export function rememberParent(child: any, parent: IDisposable | IAsyncDisposable, weak: boolean) {
	const state = debugRegistry.getOrInsert(child, { strong: false, reference: 0 });
	state.reference++;

	if (state.reference > 1) {
		// 重复注册

		const last = state.last?.deref();
		if (state.strong) {
			// 注册过强引用，不能再注册其他引用
			alertDuplicate(child, last, parent);
		} else {
			// 没有注册过强引用
			state.last = new WeakRef(parent); // 记录最新的引用作为警告信息，遇到首个强引用就不再更新

			if (weak) {
				// 允许重复注册弱引用
			} else {
				// 不允许注册强引用
				state.strong = true;
				alertDuplicate(child, last, parent);
			}
		}
	} else {
		// 第一个注册，没有问题
		state.last = new WeakRef(parent);
		state.strong = !weak;
	}
}

function _trace_4() {
	const trace = Object.assign(new Error(''), { name: 'Trace' });
	const arr = trace.stack?.split('\n') ?? [];
	arr.splice(1, 4);
	// 0: "Error: Trace"
	// 1: _trace_4
	// 2: alertDuplicate
	// 3: rememberParent / forgetParent
	// 4: caller (_register/_unregister)
	console.log(arr.join('\n'));
}
