export function isArraySame<T>(a1: T[], a2: T[]): boolean {
	if (a1.length !== a2.length) {
		return false;
	}
	for (let i = a1.length - 1; i >= 0; i--) {
		if (a1[i] !== a2[i]) {
			return false;
		}
	}
	return true;
}
