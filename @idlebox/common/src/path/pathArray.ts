import { normalizePath } from './normalizePath';

/**
 * Work on "PATH"-like values
 */
export class PathArray extends Set<string> {
	constructor(init: string, private readonly sep: ':' | ';') {
		super();
		if (init) this.add(init);
	}

	add(paths: string) {
		for (const p of paths.split(this.sep)) {
			if (!p) continue;
			super.add(normalizePath(p));
		}
		return this;
	}

	delete(paths: string) {
		let anyRet = false;
		for (const p of paths.split(this.sep)) {
			anyRet = anyRet || super.delete(normalizePath(p));
		}
		return anyRet;
	}

	has(path: string): boolean {
		return super.has(normalizePath(path));
	}

	toString() {
		return [...this.values()].join(this.sep);
	}

	/**
	 * @returns an array with `part` append to every element
	 */
	join(part: string) {
		return [...this.values()].map((p) => normalizePath(p + '/' + part));
	}
}
