export function isAbsolute(path: string) {
	return /^\/|^\\|^[a-z]:[\\/]|^[^:]{1,10}:\/\//i.test(path);
}
