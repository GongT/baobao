import { convertCaughtError } from '@idlebox/common';
import { useCallback } from 'react';
import { NeverChanging } from '../_internal/never-change.js';
import { useSymbol } from '../hook/use-symbol.js';
import { useDisabledValue } from './basic/disabled.js';
import { useError } from './basic/error.js';
import { useLoadingBoth } from './basic/loading.js';
import { ctxlog } from './basic/log.js';
import { useNotify, type INotifyController } from './notify.js';

const logger = ctxlog.extend('useAsync');
type AsyncFunction = () => Promise<any>;

export interface IAsyncControl {
	/**
	 * 是否正在加载，来自useLoading
	 */
	readonly loading: boolean;
	/**
	 * 是否被禁用，来自useDisabledValue
	 */
	readonly disabled: boolean;
	/**
	 * 上次操作的错误，来自useError
	 */
	readonly error?: Error;

	startLoading(): void;
	finishLoading(error?: Error): void;

	execute(title: string, fn: () => Promise<void>): Promise<boolean>;
	executeSilent(title: string, fn: () => Promise<void>): Promise<boolean>;

	readonly notify: INotifyController;
}

/**
 * 异步控制器
 *
 * 如果启动时disabled或loading，则execute会直接返回false（也不弹出通知）
 *
 * @param title 成功、失败后的通知（后面接“成功”）
 * @returns
 */
export function useAsync(title: string, additionalDisabled?: boolean): IAsyncControl {
	const token = useSymbol(`async/${title}`);
	const [selfIsLoading, setLoading, loading] = useLoadingBoth(token);
	const disabled = useDisabledValue(additionalDisabled);
	const [error, setError] = useError(token);
	const notify = useNotify();

	const startLoading = useCallback(() => {
		logger.debug`[startLoading] ${title}`;
		setLoading(true);
		setError(undefined);
	}, NeverChanging);
	const finishLoading = useCallback((error?: Error) => {
		logger.debug`[finishLoading] ${title} | ${error ? 'errored' : 'succeeded'}`;
		setLoading(false);
		if (error) setError(error);
	}, NeverChanging);

	async function execute(title: string, silent: boolean, fn: AsyncFunction): Promise<boolean> {
		if (disabled || selfIsLoading) {
			logger.info`拒绝执行 ${title}，因为当前处于 ${disabled ? '禁用' : ''} ${selfIsLoading ? '加载中' : ''} 状态`;
			return false;
		}

		const ok = await notify[silent ? 'executeSilent' : 'execute'](title, async () => {
			startLoading();
			try {
				await fn();
				finishLoading();
				return true;
			} catch (e) {
				finishLoading(convertCaughtError(e));
				throw e;
			}
		});

		return ok || false;
	}

	return {
		disabled,
		loading,
		error,
		startLoading,
		finishLoading,
		execute(title, fn) {
			return execute(title, false, fn);
		},
		executeSilent(title, fn) {
			return execute(title, true, fn);
		},
		notify,
	};
}
