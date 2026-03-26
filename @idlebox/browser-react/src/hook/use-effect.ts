import { useEffect, useMemo, type DependencyList, type EffectCallback } from 'react';

/**
 * 和useEffect作用一样，但effect是在render过程中同步执行的
 * 如果deps有改变，useSyncEffect返回时，effect已经运行过了
 */
export function useSyncEffect(callback: EffectCallback, deps: DependencyList) {
	const exit = useMemo(callback, deps);
	useEffect(() => {
		return exit;
	}, [exit]);
}
