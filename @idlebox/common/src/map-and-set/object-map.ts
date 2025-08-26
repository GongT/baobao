export function convertToMap<K extends string, V>(object: Record<K, V>): Map<K, V> {
	return new Map(Object.entries(object)) as Map<K, V>;
}
