export function* arrayChunk<T>(arr: T[], size: number): Generator<T[]> {
	for (let i = 0; i < arr.length; i += size) {
		const a = arr.slice(i, i + size);
		if (a.length) yield a;
	}
}
