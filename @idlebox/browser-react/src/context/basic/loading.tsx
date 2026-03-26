/**
 * 单向传播加载状态上下文
 *
 * 通过 LoadingProvider 阻断状态向上传播
 */
import { useBasicBundle } from './bundle.js';

/**
 * @param token 用于调试的标识符，强烈建议不要用默认值
 * @returns 类似于 useState
 * 注意：首个返回值表示“我自己是否有加载状态”而不是“是否有加载状态”
 */
export function useLoading(token: string | symbol = Symbol('anonymous')) {
	const store = useBasicBundle();
	const [state, setState] = store.loadingMap.useProvider(token);
	return [state ?? false, setState] as const;
}

/**
 * 是否有加载状态
 */
export function useLoadingValue(): boolean {
	const store = useBasicBundle();
	return store.loadingMap.useConsumer() || false;
}

export function useLoadingBoth(token: string | symbol = Symbol('anonymous')) {
	const store = useBasicBundle();
	const anyValue = store.loadingMap.useConsumer() || false;
	const [state, setState] = store.loadingMap.useProvider(token);
	return [state, setState, anyValue] as const;
}
