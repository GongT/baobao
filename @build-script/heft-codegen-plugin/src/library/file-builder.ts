import type { IOutputShim } from '@build-script/heft-plugin-base';
import { loadInheritedJson } from '@idlebox/json-extends-loader';
import { readFileSync } from 'fs';

function escapeRegExp(str: string) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

export class FileBuilder {
	protected referData: string[];
	protected result: string[] = [];
	private readonly _watchFiles: Set<string> = new Set<string>();

	constructor(
		public readonly filePath: string,
		public readonly logger: IOutputShim,
		public readonly projectRoot: string,
	) {
		this.referData = readFileSync(filePath, 'utf-8')
			.split('\n')
			.filter((l) => l.length > 0);
	}

	/**
	 * add files to watcher list, generator will rerun if any one change
	 * all source code (self and import() ones) will auto add to list
	 *
	 * @param files
	 */
	watchFiles(...files: string[]) {
		for (const file of files) {
			this._watchFiles.add(file);
		}
	}

	get watchingFiles() {
		return this._watchFiles;
	}

	/**
	 * load chain json with "extends" field, like tsconfig.json
	 */
	async readExtendsJson(file: string) {
		this.watchFiles(file);
		return loadInheritedJson(file);
	}

	append(text: string) {
		this.result.push(text);
		return text;
	}
	toString() {
		return this.result.join('\n');
	}

	get size() {
		return this.result.length;
	}

	/**
	 * read section from current file
	 * if markup is a string, it will exact matching entire line
	 *
	 * @param starting starting markup
	 * @param ending ending markup
	 * @param includeHeaders if true, include the starting and ending line
	 * @returns the string appended
	 */
	copySection(starting: string | RegExp, ending: string | RegExp, includeHeaders = false) {
		this.append(this.readSection(starting, ending, includeHeaders));
	}
	readSection(starting: string | RegExp, ending: string | RegExp, includeHeaders = false) {
		if (typeof starting === 'string') {
			starting = new RegExp('^' + escapeRegExp(starting) + '$');
		}
		if (typeof ending === 'string') {
			ending = new RegExp('^' + escapeRegExp(ending) + '$');
		}
		let sw = false;
		const r = [];
		for (const line of this.referData) {
			if (sw) {
				if (ending.test(line)) {
					if (includeHeaders) r.push(line);
					return r.join('\n');
				}
				r.push(line);
			} else {
				if (starting.test(line)) {
					sw = true;
					if (includeHeaders) r.push(line);
				}
			}
		}

		throw new Error(`failed find section ${sw ? 'end' : 'start'} signal: ${sw ? '' + ending : '' + starting}`);
	}

	/**
	 * Copy a function definition from current file, the function must "[export ]function fnname("
	 */
	copyFunctionDeclare(fnname: string, head = true) {
		this.append(this.readFunctionDeclare(fnname, head));
	}
	readFunctionDeclare(fnname: string, head = true) {
		return this.readSection(new RegExp(`^(?:export )?function ${escapeRegExp(fnname)}\\b`), /^}/, head);
	}

	/**
	 * Copy a interface definition from current file, the interface must "[export ]interface ifname {"
	 */
	copyInterfaceDeclare(ifname: string, head = true) {
		this.append(this.readInterfaceDeclare(ifname, head));
	}
	readInterfaceDeclare(ifname: string, head = true) {
		return this.readSection(new RegExp(`^(?:export )?interface ${escapeRegExp(ifname)}\\b`), /^}/, head);
	}

	/**
	 * Copy a enum definition from current file, the enum must "[export ][const ]enum ename {"
	 */
	copyEnumDeclare(ename: string, head = true) {
		this.append(this.readInterfaceDeclare(ename, head));
	}
	readEnumDeclare(ename: string, head = true) {
		return this.readSection(new RegExp(`^(?:export )?(?:const )?enum ${escapeRegExp(ename)} {`), /^}/, head);
	}

	seq(from: number, to: number) {
		const r: string[] = [];
		for (let i = from; i <= to; i++) {
			r.push(i.toFixed(0));
		}
		return new WrappedArray(r);
	}

	reduceRecursive(from: number, to: number, map: (arr: WrappedArray, index: string) => string) {
		const arr = this.seq(from, to);
		const strs = arr.map((v, i) => {
			return map(arr.first(i + 1), v);
		});
		return this.append(strs.toLines());
	}
}

export class WrappedArray {
	constructor(private array: string[]) {}
	toList() {
		return this.array.join(', ');
	}
	toLines() {
		return this.array.join('\n');
	}
	toUnion() {
		return this.array.join(' | ');
	}
	recursion(map: (subarr: WrappedArray) => string[]) {
		let a = [];
		for (let i = 1; i < this.array.length; i++) {
			a.push(...map(this.first(i)));
		}
		return a;
	}
	first(cnt: number | string) {
		return new WrappedArray(this.array.slice(0, typeof cnt === 'string' ? parseInt(cnt) : cnt));
	}
	prefix(p: string | ((v: string, i: number) => string)) {
		return new WrappedArray(this.array.map((i) => p + i));
	}
	postfix(p: string | ((v: string, i: number) => string)) {
		return new WrappedArray(this.array.map((i) => p + i));
	}
	map(fn: (v: string, index: number) => string) {
		return new WrappedArray(this.array.map(fn));
	}
	[Symbol.iterator]() {
		return this.array.values();
	}
}
