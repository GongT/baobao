export function mergeIterables<T>(...iterables: Iterable<T>[]): Generator<T, void, void>;
export function mergeIterables(...iterables: Iterable<unknown>[]): Generator<unknown, void, void>;
export function* mergeIterables<T>(...iterables: Iterable<T>[]) {
	for (const iterable of iterables) {
		for (const item of iterable) {
			yield item;
		}
	}
}

export function joinAsyncIterables<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]): AsyncGenerator<Awaited<T>, void, void>;
export function joinAsyncIterables(...iterables: (Iterable<unknown> | AsyncIterable<unknown>)[]): AsyncGenerator<unknown, void, void>;
export async function* joinAsyncIterables<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]) {
	for (const iterable of iterables) {
		for await (const item of iterable) {
			yield item;
		}
	}
}

export function interleaveIterables<T>(...iterables: Iterable<T>[]): Generator<T, void, void>;
export function interleaveIterables(...iterables: Iterable<unknown>[]): Generator<unknown, void, void>;
export function* interleaveIterables<T>(...iterables: Iterable<T>[]) {
	const its = iterables.map((e) => e[Symbol.iterator]());
	let active = its.length;

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
}

export function interleaveAsyncIterables<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]): AsyncGenerator<T, void, void>;
export function interleaveAsyncIterables(...iterables: (Iterable<unknown> | AsyncIterable<unknown>)[]): AsyncGenerator<unknown, void, void>;
export async function* interleaveAsyncIterables<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]) {
	const its = iterables.map((e) => (Symbol.asyncIterator in e ? (e as AsyncIterable<T>)[Symbol.asyncIterator]() : (e as Iterable<T>)[Symbol.iterator]()));
	let active = its.length;

	while (active > 0) {
		for (const it of its) {
			if (!it) continue;
			const r = await it.next();
			if (r.done) {
				active--;
				its[its.indexOf(it)] = undefined as any;
			} else {
				yield r.value;
			}
		}
	}
}
