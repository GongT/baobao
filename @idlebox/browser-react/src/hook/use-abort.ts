import { NotError } from '@idlebox/common';
import { useEffect, useRef, type DependencyList } from 'react';
import { NeverChanging } from '../_internal/never-change.js';

interface _AbortEvent extends Event {
	readonly target: AbortSignal;
}
/**
 * 创建一个AbortController，并在每次发生abort后立即自我重建，组件卸载时除外
 * *不触发render*
 *
 * 专门用于异步操作，例如fetch，默认值
 */
export function useAbort() {
	const aborterRef = useRef<AbortController>(new AbortController());

	useEffect(() => {
		function recreate() {
			aborterRef.current = new AbortController();
			aborterRef.current.signal.addEventListener('abort', onAbort);
		}
		function onAbort(e: Event) {
			const reason: any = (e as _AbortEvent).target.reason;
			console.warn('[abort] reason:', reason);
			aborterRef.current.signal.removeEventListener('abort', onAbort);
			recreate();
		}

		recreate();
		return () => {
			aborterRef.current.signal.removeEventListener('abort', onAbort);
			aborterRef.current.abort(new NotError('组件卸载'));
			aborterRef.current = undefined as any;
		};
	}, NeverChanging);

	return aborterRef.current;
}

/**
 * 监听abortSignal，并在abort时调用回调函数
 */
export function listenOnAbort(aborter: AbortController, callback: (reason: any) => void) {
	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	useEffect(() => {
		function onAbort() {
			aborter.signal.removeEventListener('abort', onAbort);
			callbackRef.current(aborter.signal.reason);
		}

		aborter.signal.addEventListener('abort', onAbort);
		return () => {
			aborter.signal.removeEventListener('abort', onAbort);
		};
	}, [aborter]);
}

type EffectFn = (abort: AbortSignal) => void | Promise<void>;

/**
 * 异步的useEffect，在组件卸载时触发abort事件
 * 此abortController和useAbort没关系
 */
export function useEffectAsync(fn: EffectFn, deps: DependencyList = NeverChanging) {
	const fnRef = useRef(fn);
	fnRef.current = fn;

	useEffect(() => {
		const aborter = new AbortController();
		(async () => {
			try {
				await fnRef.current(aborter.signal);
			} catch (e) {
				if (e instanceof NotError) {
					return;
				}
				console.error(e);
			}
		})();

		return () => {
			aborter.abort(new NotError('组件卸载或依赖变更'));
		};
	}, deps);
}
