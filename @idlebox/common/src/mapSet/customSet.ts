/** Find the index of given item */
export type Finder<Type> = (this: Type[], item: Type) => number;

type MyFinder<Type> = (item: Type) => number;

export function RegexpFinder(this: RegExp[], item: RegExp): number {
	return this.findIndex((e) => e.toString() === item.toString());
}

/**
 * Like a Set, but use custom compare function insteadof ===
 */
export class CustomSet<Type = string> {
	protected registry: Type[];
	private finder: MyFinder<Type>;

	constructor(finder: Finder<Type> = Array.prototype.indexOf) {
		this.registry = [];
		this.finder = finder.bind(this.registry);
	}

	setFinder(finder: Finder<Type>) {
		this.finder = finder.bind(this.registry);
	}

	has(item: Type): boolean {
		return this.finder(item) !== -1;
	}

	add(item: Type): boolean {
		const index = this.finder(item);
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
		const index = this.finder(item);
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

	get size() {
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
