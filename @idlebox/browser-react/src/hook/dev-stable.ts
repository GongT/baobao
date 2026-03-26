/**
 * 开发时检测函数稳定性，防止无限循环渲染
 */
import { definePrivateConstant, isProductionMode, objectName } from '@idlebox/common';
import { useCallback, useMemo, useRef, type DependencyList } from 'react';

const marker = /* #__PURE__ */ Symbol('ensure-use-callback');

/* @__NO_SIDE_EFFECTS__ */
export function iPromiseThisFunctionIsNotDynamic(fn: any) {
	definePrivateConstant(fn, marker, true);
}

function isUseCallback(fn: any) {
	return !!fn?.[marker];
}

/**
 * 禁止传入动态函数对象，尤其是 React 组件内定义的函数
 *
 * 如果一个会改变的函数确定不会每次渲染都变化，可以使用 iPromiseThisFunctionIsNotDynamic 声明，这样这个函数就会被忽略
 *
 * 例如:
 * const fn = useCallback(() =>{}, []);
 * iPromiseThisFunctionIsNotDynamic(fn);
 *
 * 或者用 useStableCallback:
 * const fn = useStableCallback(() =>{}, []);
 *
 * @__NO_SIDE_EFFECTS__
 */
export function denyDynamicFunction(fn: any) {
	const ref = useRef(fn);

	if (ref.current !== fn && !isUseCallback(fn)) {
		console.log('原本的', ref.current);
		console.log('新传入的', fn);
		throw new Error('apiCallFunction 传入的函数对象变了。此函数不能在作用域内定义，应在顶级定义，或使用 useStableCallback 包裹');
	}
}

/**
 * 与 useCallback 相同，可以防止 denyDynamicFunction() 报错
 * 注意，使用useCallback并不能魔法般的解决问题，必须确保传入的依赖是正确的
 */
export const useStableCallback: typeof useCallback = isProductionMode ? useCallback : debugUseStableCallback;

function debugUseStableCallback<T extends Function>(fn: T, deps: DependencyList): T {
	return useMemo(() => {
		iPromiseThisFunctionIsNotDynamic(fn);
		return fn;
	}, deps);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function checkNamedFunction(fn: any) {
	if (!objectName(fn)) {
		throw new Error('传入的函数必须是命名函数，不能是匿名函数');
	}
}
