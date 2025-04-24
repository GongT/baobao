/**
 * assert value is not null or undefined or NaN
 * @public
 */
export function assertNotNull<T>(val: T | null | undefined): T {
	console.assert(val !== undefined && val !== null, 'AssertValue failed, got %s(%s).', typeof val, val);
	return val!;
}

/**
 * assert value is not null or undefined or NaN
 * @throws Value is null or undefined
 * @public
 */
export function throwNull<T>(val: T) {
	if (val === undefined || val === null) {
		return val!;
	}
	throw new Error(`Value is ${typeof val}`);
}
