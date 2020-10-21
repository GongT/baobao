/**
 * Returns ms
 */
export function getTimeStamp(date: Date) {
	return Math.floor(date.getTime() / 1000);
}

/**
 * Takes ms
 */
export function fromTimeStamp(timestamp: number) {
	return new Date(1000 * timestamp);
}
