import type { IWithStack } from './stackTrace.js';

/**
 * Get nth line of Error.stack
 * @returns {string} if frame greater than max, return ''
 */
export function getErrorFrame(e: IWithStack, frame: number): string {
	if (e?.stack) {
		const stackArr = e.stack.split('\n');
		if (stackArr.length > frame + 1) {
			return stackArr[frame + 1]?.trim();
		}
	}
	return '';
}
