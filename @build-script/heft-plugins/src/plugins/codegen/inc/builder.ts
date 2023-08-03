import { loadInheritedJson } from '@idlebox/json-extends-loader';
import { readFileSync } from 'fs';
import { IOutputShim } from '../../../misc/scopedLogger';

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
	) {
		this.referData = readFileSync(filePath, 'utf-8')
			.split('\n')
			.filter((l) => l.length > 0);
	}

	watchFiles(...files: string[]) {
		for (const file of files) {
			this._watchFiles.add(file);
		}
	}

	getWatchedFiles() {
		return [...this._watchFiles.values()];
	}

	async readExtendsJson(file: string) {
		this.watchFiles(file);
		return loadInheritedJson(file);
	}

	append(text: string) {
		this.result.push(text + '\n');
		return text;
	}
	toString() {
		return this.result.join('\n');
	}

	copySection(from: string | RegExp, to: string | RegExp, includeHeaders = false) {
		if (typeof from === 'string') {
			from = new RegExp('^' + escapeRegExp(from) + '$');
		}
		if (typeof to === 'string') {
			to = new RegExp('^' + escapeRegExp(to) + '$');
		}
		let sw = false;
		const r = [];
		for (const line of this.referData) {
			if (sw) {
				if (to.test(line)) {
					if (includeHeaders) r.push(line);
					return this.append(r.join('\n'));
				}
				r.push(line);
			} else {
				if (from.test(line)) {
					sw = true;
					if (includeHeaders) r.push(line);
				}
			}
		}

		throw new Error(`failed find section ${sw ? 'end' : 'start'} signal: ${sw ? '' + to : '' + from}`);
	}

	copyFunctionDeclare(fnname: string) {
		return this.copySection(new RegExp('^' + escapeRegExp('export function ' + fnname + '(')), /^}/, true);
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
