/** @deprecated */
export interface PromiseResultArray<T> {
	count: number;
	fulfilledResult: T[];
	fulfilled: number[];
	rejectedResult: Error[];
	rejected: number[];
}

/**
 * @deprecated Use Promise.allSettled instead
 */
export function finishAllPromise<T>(ps: Promise<T>[]) {
	return new Promise<PromiseResultArray<T>>((resolve) => {
		const fulfilledResult: T[] = [];
		const rejectedResult: Error[] = [];
		const fulfilled: number[] = [];
		const rejected: number[] = [];
		let last = ps.length;

		const toDone = () => {
			if (last === 0) {
				resolve({
					count: ps.length,
					fulfilledResult,
					fulfilled,
					rejectedResult,
					rejected,
				});
			}
		};

		ps.forEach((p, index) => {
			p.then(
				(t) => {
					fulfilledResult[index] = t;
					fulfilled.push(index);
					last--;
					toDone();
				},
				(e) => {
					rejectedResult[index] = e;
					rejected.push(index);
					last--;
					toDone();
				}
			);
		});
	});
}
