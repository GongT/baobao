import type { IWithStack } from './stack-trace.js';

/**
 * Get nth line of Error.stack
 * @returns {string} if frame greater than max, return ''
 */
export function getErrorFrame(e: IWithStack, frame: number, downIfEmpty = false): string {
	if (e?.stack) {
		const stackArr = e.stack.split('\n').slice(1);
		if (stackArr.length > frame) {
			return stackArr[frame]?.trim();
		} else if (downIfEmpty) {
			for (let i = frame; i >= 0; i--) {
				if (stackArr[i]) {
					return stackArr[i].trim();
				}
			}
		}
	}
	return '';
}
