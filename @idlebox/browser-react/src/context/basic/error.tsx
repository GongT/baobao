/**
 * 单向传播错误状态上下文
 *
 * 注意: 该上下文不应用于 React渲染过程中捕获异常（用ErrorBoundary）
 * 而是用于各种实际操作中的，可恢复、重试的那种错误（例如表单验证）
 *
 * 通过 ErrorProvider 阻断状态向上传播
 */
import { isProductionMode } from '@idlebox/common';
import { useLatestCallback } from '../../hook/use-stable.js';
import { useBasicBundle } from './bundle.js';

/**
 * @param token 用于调试的标识符，强烈建议不要用默认值
 * @returns 类似于 useState
 * 注意：首个返回值表示“我自己发生的错误”而不是“任何地方有错误”
 */
export function useError(token: string | symbol = Symbol('anonymous')) {
	const store = useBasicBundle();
	const [state, setState] = store.errorMap.useProvider(token);

	if (isProductionMode) {
		return [state, setState] as const;
	}

	const setWithLog = useLatestCallback((err: Error | undefined) => {
		if (err) {
			console.error(`Error[${String(token)}]:`, err);
		} else {
			// console.info(`Error[${String(token)}] cleared`);
		}
		setState(err);
	});

	return [state, setWithLog] as const;
}

/**
 * 只关心是否有错误，而不需要控制它
 */
export function useErrorValue(): Error | undefined {
	const store = useBasicBundle();
	const error = store.errorMap.useConsumer();
	return error;
}
