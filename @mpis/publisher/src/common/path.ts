const scopePrefix = /^@/;
export function normalizeName(name: string): string {
	return name.replace(scopePrefix, '').replace(/\//g, '-');
}
