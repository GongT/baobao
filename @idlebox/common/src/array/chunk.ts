/**
 * 将数组分块
 * @param arr 数组
 * @param size 分块大小
 * @returns 分块后的数组生成器
 */
export function* arrayChunk<T>(arr: T[], size: number): Generator<T[]> {
	for (let i = 0; i < arr.length; i += size) {
		const a = arr.slice(i, i + size);
		if (a.length) yield a;
	}
}
