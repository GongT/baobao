export function isDateInvalid(date: Date) {
	return isNaN(date.getTime());
}
