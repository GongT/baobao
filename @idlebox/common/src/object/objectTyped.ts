interface IObject extends ObjectConstructor {
	fromEntries<K extends PropertyKey = string, V = any>(entries: Iterable<readonly [K, V]>): Record<K, V>;
	entries<K extends PropertyKey, V>(obj: Record<K, V>): [K, V][];
	keys<K extends PropertyKey, V>(obj: Record<K, V>): K[];
}

/**
 * 扩展类型的 Object，实际是Object的别名，但修改了部分方法的类型定义。
 */
export const ObjecT: IObject = Object as any;
