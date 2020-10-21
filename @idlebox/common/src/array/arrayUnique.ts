/**
 * Returns a new array without duplicate values
 * @public
 */
export function arrayUnique<T>(arr: T[]): T[] {
	return arr.filter((item, index) => {
		return arr.lastIndexOf(item) === index;
	});
}

/**
 * Removes duplicate values from an array
 * @public
 */
export function arrayUniqueReference(arr: any[]): void {
	for (let index = arr.length - 1; index >= 0; index--) {
		if (arr.lastIndexOf(arr[index]) !== index) {
			arr.splice(index, 1);
		}
	}
}

export interface IUniqueIdFactory<T> {
	(item: T): string;
}

function defaultFactory(t: any) {
	return t as string;
}

/**
 * Returns a function to be used in <arr>.filter()
 *
 * the returned function can use multiple times, it will remember all values inter multiple arrays
 *
 * @param {IUniqueIdFactory} idFactory function takes an array element, return it's id to be compare with each other
 * @public
 */
export function uniqueFilter<T>(idFactory: IUniqueIdFactory<T> = defaultFactory) {
	const seen: { [id: string]: true } = {};
	return function uniqueFilterInner(item: T): boolean {
		const id = idFactory(item);
		if (seen[id]) {
			return false;
		} else {
			seen[id] = true;
			return true;
		}
	};
}
