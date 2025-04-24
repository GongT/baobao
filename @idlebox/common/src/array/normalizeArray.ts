/**
 * ensure a value is an array
 * @public
 */
export function normalizeArray<T>(input: T | T[]): T[] {
	if (input && Array.isArray(input)) {
		return input;
	}
	if (typeof input !== 'undefined') {
		return [input];
	}
	return [];
}
