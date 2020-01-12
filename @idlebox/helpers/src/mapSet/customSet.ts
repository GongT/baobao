export type Finder<Type> = (this: Type[], item: Type) => number;
export type MyFinder<Type> = (item: Type) => number;

export function RegexpFinder(this: RegExp[], item: RegExp): number {
	return this.findIndex(e => e.toString() === item.toString());
}

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
		} else {
			return false;
		}
	}

	addAll(items: Type[]): Type[] {
		return items.filter(e => this.add(e));
	}

	remove(item: Type): boolean {
		const index = this.finder(item);
		if (index === -1) {
			return false;
		} else {
			this.registry.splice(index, 1);
			return true;
		}
	}

	removeAll(items: Type[]): Type[] {
		return items.filter(e => this.remove(e));
	}

	get length() {
		return this.registry.length;
	}

	[Symbol.iterator](): Iterator<Type> {
		return this.registry[Symbol.iterator]();
	}

	toArray() {
		return this.registry.slice();
	}
}
