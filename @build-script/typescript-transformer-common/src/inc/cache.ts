export function cache<T extends [], R>(fn: (...args: T) => R): (...args: T) => R {
	let cache: undefined | R;
	return (...args: T) => {
		if (!cache) {
			cache = fn(...args);
		}
		return cache;
	};
}
