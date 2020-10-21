/**
 * replace // to /
 * replace \ to /
 * remove ending /
 */
export function normalizePath(p: string) {
	return p.replace(/\\+/, '/').replace(/\/\/+/, '/').replace(/\/+$/, '');
}
