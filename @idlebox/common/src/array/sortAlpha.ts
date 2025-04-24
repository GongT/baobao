/**
 * Sort string array alphabet order
 *
 * to be used in <arr>.sort()
 * @public
 */
export function sortByString(a: string, b: string): number {
	if (a === b) {
		return 0;
	}
	if (a > b) {
		return 1;
	}
	return -1;
}
