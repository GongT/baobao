import { normalizePath } from './normalizePath';

export class PathArray extends Set<string> {
	constructor(init: string, private readonly sep: ':' | ';') {
		super();
		if (init) this.add(init);
	}

	add(path: string) {
		for (const p of path.split(this.sep)) {
			if (!p) continue;
			super.add(normalizePath(p));
		}
		return this;
	}

	delete(path: string) {
		let anyRet = false;
		for (const p of path.split(this.sep)) {
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

	join(part: string) {
		return [...this.values()].map((p) => normalizePath(p + '/' + part));
	}
}
