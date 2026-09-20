import { Exit } from '@idlebox/errors';
import { hasWindow } from '../platform/os.js';
import { getErrorFrame } from './get-frame.js';

export function convertCaughtError(e: unknown): Error {
	if (e instanceof Exit) {
		throw e;
	}
	if (e instanceof Error) {
		return e;
	}
	if (hasWindow) {
		console.error('捕获到无效错误: 类型 "%s", 值 "%s"', typeof e, e);
	} else {
		console.error('捕获到无效错误:\n    位置 %s\n    类型 %s\n    值 %s', getErrorFrame(new Error(), 1), typeof e, e);
	}
	return new Error(`无效错误: ${e}`);
}
