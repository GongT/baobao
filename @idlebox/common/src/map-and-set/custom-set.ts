/** Find the index of given item */
export type Finder<Type> = (this: Type[], item: Type) => number;

/**
 * Like a Set, but use custom compare function instead ===
 */
export abstract class CustomSet<Type> {
	protected registry: Type[] = [];

	protected abstract compare(item1: Type, item2: Type): number;

	has(item: Type): boolean {
		return this.registry.findIndex((e) => this.compare(e, item) === 0) !== -1;
	}

	add(item: Type): boolean {
		const index = this.registry.findIndex((e) => this.compare(e, item) === 0);
		if (index === -1) {
			this.registry.push(item);
			return true;
		}
		return false;
	}

	/**
	 * @returns all added values
	 */
	addAll(items: Type[]): Type[] {
		return items.filter((e) => this.add(e));
	}

	delete(item: Type): boolean {
		const index = this.registry.findIndex((e) => this.compare(e, item) === 0);
		if (index === -1) {
			return false;
		}
		this.registry.splice(index, 1);
		return true;
	}

	/**
	 * @returns all deleted values
	 */
	deleteAll(items: Type[]): Type[] {
		return items.filter((e) => this.delete(e));
	}

	clear() {
		this.registry.length = 0;
	}

	get length() {
		return this.registry.length;
	}

	[Symbol.iterator](): Iterator<Type> {
		return this.registry[Symbol.iterator]();
	}
	keys(): Iterator<Type> {
		return this.registry[Symbol.iterator]();
	}
	values(): Iterator<Type> {
		return this.registry[Symbol.iterator]();
	}
	toArray() {
		return this.registry.slice();
	}
}
