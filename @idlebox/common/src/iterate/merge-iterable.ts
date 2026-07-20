import type { AnyIterator } from './typings.internal.js';

/**
 * 按顺序连接多个可迭代对象，返回一个新的可迭代对象。
 */
export function* joinIterables<T = unknown>(...iterables: Iterable<T>[]) {
	for (const iterable of iterables) {
		yield* iterable;
	}
}

/**
 * @see joinIterables
 */
export async function* joinAsyncIterables<T = unknown>(...iterables: (Iterable<T> | AsyncIterable<T>)[]) {
	for (const iterable of iterables) {
		yield* iterable;
	}
}

/**
 * 混合多个可迭代对象，没有顺序地返回它们的元素
 *
 * 实际上是每个迭代器轮流返回一个元素
 */
export function* interleaveIterables<T = unknown>(...iterables: Iterable<T>[]) {
	const its = iterables.map((e) => e[Symbol.iterator]());
	let active = its.length;

	try {
		while (active > 0) {
			for (const it of its) {
				if (!it) continue;
				const r = it.next();
				if (r.done) {
					active--;
					its[its.indexOf(it)] = undefined as any;
				} else {
					yield r.value;
				}
			}
		}
	} finally {
		// 如果是正常循环结束，则its是空的，否则说明异常或者提前结束了（return被调用），需要调用未结束的return以模拟for...of的行为
		for (const it of its) {
			if (!it) continue;
			it.return?.();
		}
	}
}

/**
 * @see interleaveIterables
 */
export function interleaveAsyncIterables<T = unknown>(...iterables: (Iterable<T> | AsyncIterable<T>)[]): AsyncIterableIterator<T> {
	const queue: T[] = [];
	const its = new Set<AnyIterator<T>>(
		iterables.map((e) => (Symbol.asyncIterator in e ? (e as AsyncIterable<T>)[Symbol.asyncIterator]() : (e as Iterable<T>)[Symbol.iterator]())),
	);

	const throwPromise = Promise.withResolvers();
	const promises = new Map<AnyIterator<T>, Promise<void>>([[null, throwPromise.promise] as any]);

	async function _schedule(it: AnyIterator<T>) {
		try {
			const result = await it.next();

			if (result.done) {
				its.delete(it);
			} else {
				queue.push(result.value);
			}
		} catch (e) {
			throwPromise.reject(e);
			throw e;
		} finally {
			promises.delete(it);
		}
	}

	function scheduleAll() {
		for (const it of its) {
			if (promises.has(it)) continue;

			promises.set(it, _schedule(it));
		}
	}

	async function iteratorReturn(value?: any) {
		let override = value;
		for (const it of its) {
			const r = await it.return?.(value);
			if (!r) continue;

			if (r.done) {
				throw new TypeError(`异步迭代器的return方法返回的done必须为true，实际返回${JSON.stringify(r)}`);
			}
			if (r.value !== undefined) {
				override = r.value;
			}
		}
		return { done: true, value: override };
	}

	return {
		async next() {
			if (queue.length > 0) {
				// biome-ignore lint/style/noNonNullAssertion: 判断过
				return { done: false, value: queue.shift()! };
			}
			if (its.size === 0) {
				return { done: true, value: undefined };
			}

			while (true) {
				scheduleAll();
				await Promise.race(promises.values());

				if (queue.length > 0) {
					// biome-ignore lint/style/noNonNullAssertion: 判断过
					return { done: false, value: queue.shift()! };
				}
				if (its.size === 0) {
					return { done: true, value: undefined };
				}

				/**
				 * 运行一轮后queue中仍然没有元素，说明上一个产生数据的迭代器刚好done=true，重新运行一次
				 * 可能有连续n个迭代器刚好结束，所以无法得知循环具体轮数，只能while(true)
				 */
			}
		},
		return: iteratorReturn,
		throw(e) {
			throwPromise.reject(e);
			return iteratorReturn();
		},
		[Symbol.asyncIterator]() {
			return this;
		},
	};
}
