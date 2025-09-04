/**
 * assert value is not null or undefined or NaN
 * @public
 */
export function assertNotNull<T>(val: T): NonNullable<T> {
	if (val !== undefined && val !== null && !Number.isNaN(val)) {
		return val;
	} else {
		throw new Error(`Assertion failed, got nullish value: ${typeof val}(${val}).`);
	}
}
