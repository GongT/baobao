/**
 * return true if a path is absolute:
 *   - /xxxx
 *   - \xxxx
 *   - c:/
 *   - c:\
 *   - http://
 */
export function isAbsolute(path: string) {
	return /^\/|^\\|^[a-z]:[\\/]|^[^:]{1,10}:\/\//i.test(path);
}
