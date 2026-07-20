import type { AnyIterator } from './typings.internal.js';

/**
 * 操作迭代器
 */
export function asyncIterator<T>(itr: AnyIterator<T>) {
	return new AsyncIteratorOperate(itr);
}

class AsyncIteratorOperate<T> {
	constructor(private readonly itr: AnyIterator<T>) {}

	/**
	 * 操作迭代器
	 *
	 * ```javascript
	 *   let last;
	 *   for await (const value of itr) {
	 *       last = value;
	 *   }
	 *   return last;
	 * ```
	 */
	async last(): Promise<T> {
		let lastValue: any;
		let result: any;
		do {
			const itr: IteratorResult<any> = await this.itr.next(result);

			if (itr.done) {
				if (Object.hasOwn(itr, 'value')) {
					lastValue = itr.value;
				}
				if (lastValue?.[Symbol.asyncIterator] || lastValue?.[Symbol.iterator]) {
					const itr = lastValue[Symbol.asyncIterator]?.() ?? lastValue[Symbol.iterator]?.();

					return new AsyncIteratorOperate<T>(itr).last();
				} else {
					result = lastValue;
				}
				break;
			} else {
				lastValue = itr.value;
			}
		} while (true);

		return result;
	}
}
