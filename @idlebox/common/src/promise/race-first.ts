import { convertCaughtError } from '../error/convert-unknown.js';

export function raceFirstSuccess<T>(promises: PromiseLike<T>[]): Promise<T> {
	return new Promise((resolve, reject) => {
		const errors: Error[] = [];
		const totalCount = promises.length;

		for (const p of promises) {
			Promise.resolve(p)
				.then(resolve)
				.catch((e: any) => {
					errors.push(convertCaughtError(e));
					if (errors.length === totalCount) {
						reject(new AggregateError(errors, 'All promises were rejected'));
					}
				});
		}
	});
}
