export interface MapLike<V> {
	[id: string]: V;
}

/**
 * A map, will throw error when try to get not exists key
 */
export class ExtendMap<K, V> extends Map<K, V> {
	/**
	 * Get value from map, if not exists, throw an error
	 */
	public get(id: K): V;
	/**
	 * Get value from map, if not exists, return def instead (not insert it into map)
	 */
	public get(id: K, def: V): V;

	public get(id: K, def?: V): V {
		if (super.has(id)) {
			return super.get(id)!;
		} else if (arguments.length === 2) {
			return def!;
		} else {
			throw new Error(`Unknown key {${id}} in map.`);
		}
	}

	/**
	 * Get a value, if not exists, call init() and set to map
	 */
	public entry(id: K, init: (id: K) => V): V {
		if (super.has(id)) {
			return super.get(id)!;
		} else {
			const nv = init(id);
			super.set(id, nv);
			return nv;
		}
	}
}
