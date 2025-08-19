/**
 * Check if a date is NaN
 */
export function isDateInvalid(date: Date) {
	return Number.isNaN(date.getTime());
}
