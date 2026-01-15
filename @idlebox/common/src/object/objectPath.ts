/**
 * Get deep child property of an object
 * @param path object path seprate by "."
 */
export function objectPath(obj: object, path: string): any {
	path.split('.').every((name) => {
		obj = (obj as any)[name];
		return !!obj;
	});
	return obj;
}

type KeyType = string | number | symbol;
/**
 * Mutate an object by path
 *
 * @param object the object to mutate, by reference
 */
export class ObjectPath {
	constructor(public readonly object: any) {}

	/**
	 * Get a value from the object by path
	 * @param path the path to get, must not be empty
	 * @returns undefined if any part not found
	 */
	public get(path: readonly KeyType[]) {
		if (path.length === 0) throw new Error('path must not be empty');
		const rest = path.slice();
		// biome-ignore lint/style/noNonNullAssertion: slice
		const last = rest.pop()!;

		let cursor = this.object;
		for (const p of rest) {
			if (typeof cursor[p] !== 'object') {
				return undefined;
			}
			cursor = cursor[p];
		}

		return cursor[last];
	}

	public exists(path: readonly KeyType[]) {
		if (path.length === 0) throw new Error('path must not be empty');
		const rest = path.slice();
		// biome-ignore lint/style/noNonNullAssertion: slice
		const last = rest.pop()!;

		let cursor = this.object;
		for (const p of rest) {
			if (typeof cursor[p] !== 'object') {
				return false;
			}
			cursor = cursor[p];
		}

		return Object.hasOwn(cursor, last);
	}

	/**
	 * Set value on a path
	 * @param path the path to set, must not be empty
	 * @param value
	 */
	public set(path: readonly KeyType[], value: any) {
		if (path.length === 0) throw new Error('path must not be empty');
		function walkSet(cursor: any) {
			const rest = path.slice();
			// biome-ignore lint/style/noNonNullAssertion: 100%
			const last = rest.pop()!;

			for (const [index, name] of rest.entries()) {
				if (!cursor[name]) {
					const next = path[index + 1];
					if (typeof next === 'number') {
						cursor[name] = [];
					} else {
						cursor[name] = {};
					}
				}
				cursor = cursor[name];
			}
			cursor[last] = value;
		}
		function walkDelete(cursor: any) {
			const rest = path.slice();
			// biome-ignore lint/style/noNonNullAssertion: slice
			const last = rest.pop()!;
			const objects = [];
			for (const name of rest) {
				objects.unshift({ object: cursor, child: name });
				cursor = cursor[name];
				if (typeof cursor !== 'object') break;
			}

			if (cursor) {
				if (Array.isArray(cursor) && typeof last === 'number') {
					if (last < cursor.length) {
						cursor.splice(last, 1);
					}
				} else {
					delete cursor[last];
				}
			}

			for (const { object, child } of objects) {
				if (typeof object[child] !== 'object' || isEmptyObject(object[child])) {
					delete object[child];
				}
			}
		}

		if (value === undefined) {
			walkDelete(this.object);
		} else {
			walkSet(this.object);
		}
	}
}

function isEmptyObject(obj: any): boolean {
	return Object.keys(obj).length === 0;
}
