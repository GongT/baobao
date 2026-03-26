import { useEffect, useRef } from 'react';
import { NeverChanging } from '../_internal/never-change.js';

/**
 * 相当于 useEffect(fn, [])，满足 useEffect 不允许函数随便返回的问题
 * 主要用于use一个异步函数
 */
export function useInitialize(fn: () => any) {
	useEffect(() => {
		fn();
	}, NeverChanging);
}

/**
 * 在组件初始化时，延迟一段时间后调用函数
 *
 * 注意: 这也同时会跳过StrictMode的重渲染过程，你最好知道这意味着什么
 */
export function useDebouncedInitialize(fn: () => any, delay: number) {
	const callbackRef = useRef<Function | boolean>(true);
	if (callbackRef.current) {
		callbackRef.current = fn;
	}

	useInitialize(() => {
		const handle = setTimeout(() => {
			if (!callbackRef.current) return;

			(callbackRef.current as Function)();
			callbackRef.current = false;
		}, delay);
		return () => {
			clearTimeout(handle);
			if (callbackRef.current) {
				callbackRef.current = true;
			}
		};
	});
}
