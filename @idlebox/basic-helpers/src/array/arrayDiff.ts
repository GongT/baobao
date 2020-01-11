export interface IArrayUpdate<T> {
	add: T[];
	del: T[];
	same: T[];
}

export function arrayDiff<T>(before: T[], after: T[]) {
	before = before.slice().sort();
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
	return {add, del, same};
}
