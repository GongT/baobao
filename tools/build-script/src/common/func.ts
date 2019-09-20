export function isArrayOfString(arr: string[]) {
	if (!Array.isArray(arr)) {
		return false;
	}
	return arr.every(item => typeof item === 'string');
}
