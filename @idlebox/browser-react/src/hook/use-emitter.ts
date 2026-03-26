import type { EventRegister } from '@idlebox/common';
import { useReducer, useState, useSyncExternalStore } from 'react';
import { toCleanup } from '../helpers/dispose-to-cleanup.js';
import { useForceUpdate } from './force-update.js';
import { useDisposableEffect } from './use-dispose.js';

/**
 * 当Event触发时，重新计算值
 * @param handle
 * @param responsive
 */
export function useEventReactive<T>(handle: EventRegister<any>, responsive: () => T) {
	return useSyncExternalStore((notify) => {
		return toCleanup(handle(notify));
	}, responsive);
}

/**
 * Event最后一次触发时的值
 */
export function useLastEvent<T>(handle: EventRegister<T>, initial: T): T;
export function useLastEvent<T>(handle: EventRegister<T>): T | undefined;
export function useLastEvent<T>(handle: EventRegister<T>, initial?: T): T | undefined {
	const [value, setValue] = useState<T | undefined>(initial);

	useDisposableEffect(
		function listenEventToRemember() {
			return handle(setValue);
		},
		[handle],
	);

	return value;
}

/**
 * 事件驱动reducer
 */
export function useEventReducer<S, A>(handle: EventRegister<A>, reducer: (state: S, action: A) => S, initial: S): S {
	const [state, setState] = useReducer(reducer, initial);

	useDisposableEffect(
		function listenEventToRemember() {
			return handle(setState);
		},
		[handle],
	);

	return state;
}

/**
 * 监听Event
 */
export function useEventListener<T>(handle: EventRegister<T>, event?: (data: T) => void) {
	useDisposableEffect(
		function listenEvent() {
			if (!event) {
				return;
			}
			return handle(event);
		},
		[handle, event],
	);
}

/**
 * 当Event触发时，重新渲染组件
 */
export function useEventRefresh<T>(handle: EventRegister<T>, disabled: boolean = false) {
	const forceUpdate = useForceUpdate();
	useDisposableEffect(
		function listenEventToRefresh() {
			if (disabled) {
				return;
			}
			return handle(forceUpdate);
		},
		[disabled, handle],
	);
}
