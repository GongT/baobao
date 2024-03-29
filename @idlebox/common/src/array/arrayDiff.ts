/**
 * @public
 */
export interface IArrayUpdate<T> {
	add: T[];
	del: T[];
	same: T[];
}

/**
 * Compare two array, returns the difference from `before` to `after`
 * @public
 */
export function arrayDiff<T>(_before: readonly T[], after: readonly T[]) {
	const before = _before.slice().sort();
	const add: T[] = after.slice().sort();
	const del: T[] = [];
	const same: T[] = [];
	next: while (before.length) {
		const item = before.pop()!;
		for (let j = add.length - 1; j >= 0; j--) {
			if (item === add[j]) {
				same.push(item);
				add.splice(j, 1);
				continue next;
			}
		}
		del.push(item);
	}
	return { add, del, same };
}
