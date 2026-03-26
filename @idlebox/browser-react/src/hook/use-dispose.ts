import type { IDisposable } from '@idlebox/common';
import { useEffect, type DependencyList } from 'react';
import { NeverChanging } from '../_internal/never-change.js';
import { toCleanup } from '../helpers/dispose-to-cleanup.js';
import { checkNamedFunction } from './dev-stable.js';

type _D = Disposable | AsyncDisposable | IDisposable;

/**
 * 和useEffect作用一样，但effect返回 disposable，而不是cleanup函数
 */
export function useDisposableEffect(effect: () => _D | undefined, deps: DependencyList = NeverChanging) {
	checkNamedFunction(effect);

	useEffect(() => {
		const obj = effect();
		if (!obj) return;

		return toCleanup(obj);
	}, deps);
}
