/**
 * 单向传播禁用状态上下文
 *
 * 通过 DisabledProvider 阻断状态向上传播
 */

import { useBasicBundle } from './bundle.js';

/**
 * @param token 用于调试的标识符，强烈建议不要用默认值
 * @returns 类似于 useState
 * 注意：首个返回值表示“我自己是否被禁用”而不是“是否有被禁用”
 */
export function useDisabled(token: string | symbol = Symbol('anonymous')) {
	const store = useBasicBundle();
	const [state, setState] = store.disableMap.useProvider(token);
	return [state ?? false, setState] as const;
}

/**
 * 是否有被禁用
 */
export function useDisabledValue(disabled: boolean = false): boolean {
	const store = useBasicBundle();
	const ctxDis = store.disableMap.useConsumer();
	return disabled || ctxDis || false;
}
