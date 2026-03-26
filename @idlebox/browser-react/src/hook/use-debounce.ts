import { useCallback, useEffect, useRef } from 'react';
import { NeverChanging } from '../_internal/never-change.js';
import { useLatestCallback } from './use-stable.js';

/**
 * 创建一个防抖函数
 */
export function useDebounce<T extends CallableFunction>(action: T, delay: number): T {
	const timeoutRef = useRef<number>(0);
	const callbackRef = useRef<T>(action);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = 0;
			}
		};
	}, NeverChanging);

	callbackRef.current = action;

	return useCallback(
		(...args: any) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = window.setTimeout(() => {
				timeoutRef.current = 0;
				callbackRef.current(...args);
			}, delay);
		},
		[delay],
	) as unknown as T;
}

/**
 * 创建一个防抖函数，延时可变
 * @returns 返回一个函数，第一个参数为延时毫秒数，后续参数为传递给 action 的参数
 */
export function useDebounceDynamic<Args extends any[], Ret>(
	action: (...args: Args) => Ret,
): (delay: number, ...args: Args) => void {
	const timeoutRef = useRef<number>(0);
	const callback = useLatestCallback(action);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = 0;
			}
		};
	}, NeverChanging);

	return useCallback((timeout: number, ...args: any) => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = window.setTimeout(() => {
			timeoutRef.current = 0;
			callback(...args);
		}, timeout);
	}, NeverChanging);
}
