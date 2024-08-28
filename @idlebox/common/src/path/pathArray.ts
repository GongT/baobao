import { isWindows } from '../platform/os';
import { ucfirst } from '../string/castCase';
import { normalizePath } from './normalizePath';

const isAbsolute = /^[a-z]:[/\\]/i;

/**
 * Work on "PATH"-like values, but always use / insteadof \
 */
abstract class PathArrayAbstract extends Set<string> {
	constructor(
		init: string,
		private readonly sep: ':' | ';' = isWindows ? ';' : ':',
	) {
		super();
		if (init) this.add(init);
	}

	abstract normalize(path: string): string;

	split(pathArrStr: string) {
		return pathArrStr.split(this.sep);
	}

	override toString() {
		return [...this.values()].join(this.sep);
	}

	/** @deprecated @use values() */
	override keys(): IterableIterator<string> {
		throw new Error('not impl');
	}

	/** @deprecated @use values() */
	override entries(): IterableIterator<[string, string]> {
		throw new Error('not impl');
	}

	[Symbol.iterator]() {
		return this.values();
	}

	/**
	 * @returns an array with `part` append to every element
	 */
	join(part: string) {
		return [...this.values()].map((p) => normalizePath(p + '/' + part));
	}
}

export class PathArrayWindows extends PathArrayAbstract {
	private readonly caseMap = new Map<string, string>();

	override normalize(path: string) {
		path = normalizePath(path);
		if (isAbsolute.test(path)) {
			path = ucfirst(path);
		}
		return path;
	}

	override clear(): void {
		super.clear();
		this.caseMap.clear();
	}

	override add(paths: string) {
		for (const p of this.split(paths)) {
			const rpath = this.normalize(p);
			const lcase = rpath.toLowerCase();
			this.caseMap.set(lcase, rpath);
			super.add(lcase);
		}
		return this;
	}

	override delete(paths: string) {
		let anyRet = false;
		for (const p of this.split(paths)) {
			const rpath = this.normalize(p);
			const lcase = rpath.toLowerCase();
			this.caseMap.delete(lcase);
			anyRet = anyRet || super.delete(lcase);
		}
		return anyRet;
	}

	override has(path: string): boolean {
		return super.has(this.normalize(path).toLowerCase());
	}

	override values() {
		return this.caseMap.values();
	}
}
export class PathArrayPosix extends PathArrayAbstract {
	override normalize(path: string) {
		return normalizePath(path);
	}

	override add(paths: string) {
		for (const p of this.split(paths)) {
			super.add(this.normalize(p));
		}
		return this;
	}

	override delete(paths: string) {
		let anyRet = false;
		for (const p of this.split(paths)) {
			anyRet = anyRet || super.delete(this.normalize(p));
		}
		return anyRet;
	}

	override has(path: string): boolean {
		return super.has(this.normalize(path));
	}
}

const TypePathArrayAbstract = isWindows ? PathArrayWindows : PathArrayPosix;

export class PathArray extends TypePathArrayAbstract {}
