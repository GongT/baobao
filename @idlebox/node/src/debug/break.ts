import inspector from 'node:inspector';
import { open } from 'node:inspector/promises';

/**
 * 把这个写在第一行正式运行的脚本前，模拟类似 --inspect-brk 的行为
 */
export function debuggerBreakUserEntrypoint() {
	if (inspector.url() && process.argv.find((e) => e.startsWith('--inspect-brk'))) {
		// biome-ignore lint/suspicious/noDebugger: expect
		debugger;
	}
}

export function forceDebuggerBreak(port = undefined) {
	if (inspector.url()) {
		// biome-ignore lint/suspicious/noDebugger: expect
		debugger;
	} else {
		open(port, undefined, true);
		// biome-ignore lint/suspicious/noDebugger: expect
		debugger;
	}
}
