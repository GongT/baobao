import { isWindows } from '../platform/os.js';
import { ucfirst } from '../string/castCase.js';
import { normalizePath } from './normalizePath.js';

const isAbsolute = /^[a-z]:[/\\]/i;

/**
 * Work on "PATH"-like values, but always use / instead-of \
 */
abstract class PathArrayAbstract {
	private readonly array: string[] = [];

	constructor(
		init: string | string[] = [],
		private readonly sep: ':' | ';' = isWindows ? ';' : ':',
	) {
		if (Array.isArray(init)) {
			for (const item of init) {
				this.add(item);
			}
		} else {
			this.add(init);
		}
	}

	get size() {
		return this.array.length;
	}

	/**
	 * 添加value到数组
	 * @param value 路径，允许传入是字符串表达的数组（/a:/b:/c）
	 * @param first 是否将路径添加到数组的开头
	 * @param force 是否强制添加路径，即使它已经存在
	 */
	add(value: string, first: boolean = false, force: boolean = false) {
		for (const part of this.split(value)) {
			if (force) {
				this._delete(part);
			}
			this._add(part, first);
		}
	}

	protected _add(normalizedPath: string, prepend: boolean = false) {
		if (this.has(normalizedPath)) return false;
		if (prepend) {
			this.array.unshift(normalizedPath);
		} else {
			this.array.push(normalizedPath);
		}
		return true;
	}

	delete(value: string) {
		let anyRet = false;
		for (const part of this.split(value)) {
			anyRet = anyRet || this._delete(part);
		}
		return anyRet;
	}

	protected _delete(normalizedPath: string) {
		const index = this.array.indexOf(normalizedPath);
		if (index !== -1) {
			this.array.splice(index, 1);
			return true;
		}
		return false;
	}

	split(value: string): string[] {
		return value.split(this.sep).map((p) => this.normalize(p));
	}

	has(value: string) {
		return this.array.includes(this.normalize(value));
	}

	/**
	 * Normalize the given path. it maybe relative or absolute.
	 */
	abstract normalize(path: string): string;

	toString(): string {
		return this.array.join(this.sep);
	}
	toArray(): string[] {
		return this.array.slice();
	}

	[Symbol.iterator]() {
		return this.array.values();
	}

	values() {
		return this.array.values();
	}

	/**
	 * @returns an array with `part` append to every element
	 */
	joinpath(part: string) {
		return this.array.map((p) => `${p}/${part}`);
	}

	clear() {
		this.array.length = 0;
	}
}

/**
 * handle PATH like values, but always use / instead of \
 */
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

	override _add(normalizedPath: string) {
		const lcase = normalizedPath.toLowerCase();
		this.caseMap.set(lcase, normalizedPath);
		return super._add(lcase);
	}

	override _delete(normalizedPath: string) {
		const lcase = normalizedPath.toLowerCase();
		this.caseMap.delete(lcase);
		return super._delete(lcase);
	}

	override has(path: string): boolean {
		return this.caseMap.has(this.normalize(path).toLowerCase());
	}
}

export class PathArrayPosix extends PathArrayAbstract {
	override normalize(path: string) {
		return normalizePath(path);
	}
}

const TypePathArrayAbstract = isWindows ? PathArrayWindows : PathArrayPosix;

export class PathArray extends TypePathArrayAbstract {}
