/**
 * A map, will throw error when try to get not exists key
 */
export class RequiredMap<K, V> extends Map<K, V> {
	/**
	 * Get value from map, if not exists, throw an error
	 */
	public override get(id: K): V;
	/**
	 * Get value from map, if not exists, return def instead (not insert it into map)
	 */
	public override get(id: K, def: V): V;

	public override get(id: K, def?: V): V {
		if (super.has(id)) {
			// biome-ignore lint/style/noNonNullAssertion: has
			return super.get(id)!;
		}
		if (arguments.length === 2) {
			// biome-ignore lint/style/noNonNullAssertion: 1
			return def!;
		}
		throw new Error(`Unknown key {${id}} in map.`);
	}

	/**
	 * Get a value, if not exists, call init() and save to map
	 */
	public entry(id: K, init: (id: K) => V): V {
		if (super.has(id)) {
			// biome-ignore lint/style/noNonNullAssertion: has
			return super.get(id)!;
		}
		const nv = init(id);
		super.set(id, nv);
		return nv;
	}
}

/**
 * A map that holds instances, automatically create new instance
 */
export abstract class InstanceMap<K, V> extends Map<K, V> {
	protected abstract instance(key: K): V;

	/**
	 * Get a value, if not exists, call init() and save to map
	 */
	public override get(id: K): V {
		if (super.has(id)) {
			// biome-ignore lint/style/noNonNullAssertion: has
			return super.get(id)!;
		}
		const nv = this.instance(id);
		super.set(id, nv);
		return nv;
	}
}
