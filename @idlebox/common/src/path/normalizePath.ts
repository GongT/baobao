/**
 * replace // to /
 * replace \ to /
 * remove ending /
 */
export function normalizePath(p: string) {
	if (p.startsWith('file:')) {
		throw new Error('normalizePath not support file url.');
	}
	return p.replace(/\\+/g, '/').replace(/\/\/+/g, '/').replace(/\/+$/, '');
}
