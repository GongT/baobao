import { useEffect, useRef } from 'react';
import { ComponentUnmounted } from '../errors/wellknown.js';

interface _AbortEvent extends Event {
	readonly target: AbortSignal;
}

/**
 * 每次abort后立刻重建的 AbortController
 *
 * 在组件卸载时会触发abort，传递 ComponentUnmounted 作为 reason
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
			if (reason instanceof ComponentUnmounted) {
			} else {
				console.warn('[abort] reason:', reason);
			}
			aborterRef.current.signal.removeEventListener('abort', onAbort);
			recreate();
		}

		recreate();
		return () => {
			aborterRef.current.abort(new ComponentUnmounted());
		};
	}, []);

	return aborterRef.current;
}

export function listenOnAbort(aborter: AbortController, callback: (reason: any) => void) {
	useEffect(() => {
		function onAbort() {
			aborter.signal.removeEventListener('abort', onAbort);
			callback(aborter.signal.reason);
		}

		aborter.signal.addEventListener('abort', onAbort);
		return () => {
			aborter.signal.removeEventListener('abort', onAbort);
		};
	}, [aborter, callback]);
}
