/**
 * Check if a date is NaN
 */
export function isDateInvalid(date: Date) {
	return isNaN(date.getTime());
}
