/** biome-ignore-all lint/correctness/useHookAtTopLevel: 比较特殊 */
import { nameObject, objectName } from '@idlebox/common';
import { useMemo, useRef } from 'react';
import { NeverChanging } from '../_internal/never-change.js';
import { iPromiseThisFunctionIsNotDynamic } from './dev-stable.js';

const latestSymbol = Symbol('is-latest-callback');

/**
 * 创建一个稳定的函数引用，永远不会变更，且总是调用最新的函数
 *
 * 所 见 即 所 得
 */
export function useLatestCallback<T extends (...args: any[]) => any>(fn: T): T {
	if (isLatestCallback(fn)) {
		return fn;
	}

	const fnRef = useRef(fn);
	fnRef.current = fn;

	return useMemo(() => {
		const wrapped = (...args: Parameters<T>) => {
			return fnRef.current(...args);
		};

		iPromiseThisFunctionIsNotDynamic(wrapped);

		// 短路
		Object.assign(wrapped, { latestSymbol: true });

		// 复制函数名
		const named = objectName(fn);
		if (named) nameObject(named, wrapped);

		return wrapped;
	}, NeverChanging) as T;
}

export function isLatestCallback(fn: Function): boolean {
	return (fn as any)[latestSymbol];
}
