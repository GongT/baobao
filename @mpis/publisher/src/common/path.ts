export function normalizeName(name: string): string {
	return name.replace(/^@/, '').replace(/\//g, '-');
}
