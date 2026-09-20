import inspector from 'node:inspector';
import { open } from 'node:inspector/promises';

/**
 * 强行触发调试器断点
 *
 * 如果没有调试器，则等待调试器连接后再触发断点
 *
 * 仅开发使用，如果没有调试器则程序无法继续运行
 *
 * @param port 调试器监听的端口，默认为 9229
 */
export function forceDebuggerBreak(port = 9229) {
	// if (process.env.CI) {
	// 	throw new Error('试图在 CI 环境中触发调试器断点');
	// }
	if (inspector.url()) {
		// biome-ignore lint/suspicious/noDebugger: expect
		debugger;
	} else {
		open(port, '::', true);
		// biome-ignore lint/suspicious/noDebugger: expect
		debugger;
	}
}
