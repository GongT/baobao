export function normalizePath(p: string) {
	return p
		.replace(/\\+/, '/')
		.replace(/\/\/+/, '/')
		.replace(/\/+$/, '');
}
