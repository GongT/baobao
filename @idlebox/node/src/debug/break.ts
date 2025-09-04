import inspector from 'node:inspector';

/**
 * 把这个写在第一行正式运行的脚本前，模拟类似 --inspect-brk 的行为
 */
export function debuggerBreakUserEntrypoint() {
	if (inspector.url() && process.argv.find((e) => e.startsWith('--inspect-brk'))) {
		// biome-ignore lint/suspicious/noDebugger: expect
		debugger;
	}
}
