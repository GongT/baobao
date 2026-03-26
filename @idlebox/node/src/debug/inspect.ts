import inspector from 'node:inspector';

let hasInspect: boolean | undefined;
/**
 * 以下情况返回true:
 * - `inspector.url()` 返回非空
 * - execArgv包含“--inspect”、“--inspect-brk”
 * - NODE_OPTIONS包含“--inspect”、“--inspect-brk”
 */
export function hasInspector(): boolean {
	if (hasInspect === undefined) {
		hasInspect = !!inspector.url() || process.execArgv.some(filterInspectArgs) || checkInspectEnv();
	}
	return hasInspect;
}

const inspectArgs = /(^|\s)--inspect(-brk)?(\s|$|=)/;
function checkInspectEnv(): boolean {
	if (!process.env.NODE_OPTIONS) return false;
	if (inspectArgs.test(process.env.NODE_OPTIONS)) return true;
	return false;
}
function filterInspectArgs(arg: string) {
	return arg === '--inspect' || arg.startsWith('--inspect=') || arg === '--inspect-brk' || arg.startsWith('--inspect-brk=');
}
