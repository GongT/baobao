/**
 * Pad number to two digits string, used in time format
 * @public
 */
export function pad2(s: number) {
	if (s < 10) {
		return `0${s}`;
	}
	return `${s}`;
}
