import { escapeRegExp } from '@idlebox/common';
import { readFileSync } from 'fs';

export class FileBuilder {
	protected referData: string[];
	protected result: string[] = [];

	constructor(protected readonly referFile: string) {
		this.referData = readFileSync(referFile, 'utf-8')
			.split('\n')
			.filter((l) => l.length > 0);
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
		return wrapArr(r);
	}

	reduceRecursive(from: number, to: number, map: (arr: IWrapArray, index: string) => string) {
		const arr = this.seq(from, to);
		const strs = arr.map((v, i) => {
			return map(arr.first(i + 1), v);
		});
		return this.append(strs.toLines());
	}
}

interface IWrapArray {
	prefix(p: string): IWrapArray;
	toList(): string;
	toLines(): string;
	first(cnt: number): IWrapArray;
	map(fn: (v: string, index: number) => string): IWrapArray;
	[Symbol.iterator](): IterableIterator<string>;
}

function wrapArr(arr: string[]): IWrapArray {
	return {
		toList() {
			return arr.join(', ');
		},
		toLines() {
			return arr.join('\n');
		},
		first(cnt: number | string) {
			return wrapArr(arr.slice(0, typeof cnt === 'string' ? parseInt(cnt) : cnt));
		},
		prefix(p: string) {
			return wrapArr(Array.prototype.map.call(arr, (i) => p + i) as string[]);
		},
		map(fn: (v: string, index: number) => string) {
			return wrapArr(Array.prototype.map.call(arr, fn) as string[]);
		},
		[Symbol.iterator]() {
			return arr.values();
		},
	};
}
