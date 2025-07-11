import { escapeRegExp } from '@idlebox/common';
import { readFileSync } from 'node:fs';
import { extname, isAbsolute, resolve } from 'node:path';
import type { ILogger } from '../common/output.js';

const endingQuote = /^}/;
const hasJsSuffix = /\.[cm]?jsx?$/i;

export class FileBuilder {
	protected _referData?: string[];
	protected result: string[] = [];
	public readonly absolutePath: string;
	public readonly relativePath: string;

	constructor(
		protected readonly projectRoot: string,
		private readonly selfPath: string,
		name: string,
		public readonly logger: ILogger,
	) {
		if (hasJsSuffix.test(name)) {
			throw new Error(`file name "${name}" should not have a .js suffix. Use .ts (or omit) instead`);
		}
		if (isAbsolute(name)) {
			if (!name.startsWith('/')) {
				throw new Error(`file name "${name}" should not be absolute.`); // windows drive
			}
			name = resolve(projectRoot, `./${name}`);
		} else {
			name = resolve(selfPath, '..', name);
		}

		if (!name.startsWith(projectRoot)) {
			logger.warn(`output file "${name}" is not under the project root "${projectRoot}"`);
		}

		const ext = extname(name) || '.ts';

		if (name.endsWith(ext)) {
			name = name.slice(0, -ext.length);
		}

		name = `${name}.generated${ext}`;

		this.relativePath = name;
		this.absolutePath = resolve(projectRoot, name);
	}

	get referData() {
		if (!this._referData) {
			this._referData = readFileSync(this.selfPath, 'utf-8')
				.split('\n')
				.filter((l) => l.length > 0);
		}
		return this._referData;
	}
	append(text: string) {
		this.result.push(text);
		return text;
	}

	prepend(text: string) {
		this.result.unshift(text);
		return text;
	}

	toString() {
		if (this.result.at(-1) !== '') {
			this.result.push('');
		}
		return this.result.join('\n');
	}

	get size() {
		return this.result.length;
	}

	/**
	 * 从当前文件复制一段文本
	 * 如果 markup 是 string，则完全匹配整行
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
			starting = new RegExp(`^${escapeRegExp(starting)}$`);
		}
		if (typeof ending === 'string') {
			ending = new RegExp(`^${escapeRegExp(ending)}$`);
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

		throw new Error(`failed find section ${sw ? 'end' : 'start'} signal: ${sw ? `${ending}` : `${starting}`}`);
	}

	/**
	 * 从当前文件中复制函数定义，接口必须以 "[export ]function fnname("
	 */
	copyFunctionDeclare(fnname: string, head = true) {
		this.append(this.readFunctionDeclare(fnname, head));
	}
	readFunctionDeclare(fnname: string, head = true) {
		return this.readSection(new RegExp(`^(?:export )?function ${escapeRegExp(fnname)}\\b`), endingQuote, head);
	}

	/**
	 * 从当前文件中复制接口定义，接口必须以 "[export ]interface ifname {" 开头
	 */
	copyInterfaceDeclare(ifname: string, head = true) {
		this.append(this.readInterfaceDeclare(ifname, head));
	}
	readInterfaceDeclare(ifname: string, head = true) {
		return this.readSection(new RegExp(`^(?:export )?interface ${escapeRegExp(ifname)}\\b`), endingQuote, head);
	}

	/**
	 * 从当前文件中复制枚举定义，枚举必须以 "[export ][const ]enum ename {" 开头
	 */
	copyEnumDeclare(ename: string, head = true) {
		this.append(this.readEnumDeclare(ename, head));
	}
	readEnumDeclare(ename: string, head = true) {
		return this.readSection(new RegExp(`^(?:export )?(?:const )?enum ${escapeRegExp(ename)} {`), endingQuote, head);
	}

	/**
	 * 生成一个指定范围的数字序列（以字符串表示）
	 */
	seq(from: number, to: number) {
		const r: string[] = [];
		for (let i = from; i <= to; i++) {
			r.push(i.toFixed(0));
		}
		return new WrappedArray(r);
	}

	import(what: string[], where: string): string;
	import(type: true, what: string[], where: string): string;
	import(type: boolean | string[], what: string | string[], where?: string): string {
		if (typeof type !== 'boolean') {
			where = what as string;
			what = type;
			type = false;
		}
		if (Array.isArray(what)) {
			what = what.join(', ');
		}
		if (type) {
			return this.prepend(`import type { ${what} } from '${where}';`);
		} else {
			return this.prepend(`import { ${what} } from '${where}';`);
		}
	}

	/**
	 * 从from到to每一个数字n
	 * 生成数组Ax = [0...n]
	 * 然后对每个Ax执行map
	 * 将map返回的字符串连接到一起
	 */
	reduceRecursive(from: number, to: number, map: (arr: WrappedArray, index: string) => string) {
		const arr = this.seq(from, to);
		const strs = arr.map((v, i) => {
			return map(arr.begining(i + 1), v);
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

	/**
	 * 从0到length，每前N项组成一个新数组A1...AN
	 * 对每个Ax执行map，返回数组Bx
	 * 然后把所有Bx连接成一个一维数组
	 */
	recursion(map: (subarr: WrappedArray) => string[]) {
		const a = [];
		for (let i = 1; i < this.array.length; i++) {
			a.push(...map(this.begining(i)));
		}
		return a;
	}

	/**
	 *	获取数组的前几个元素
	 */
	begining(cnt: number | string) {
		return new WrappedArray(this.array.slice(0, typeof cnt === 'string' ? Number.parseInt(cnt) : cnt));
	}
	/**
	 *	获取数组的后几个元素
	 */
	ending(cnt: number | string) {
		return new WrappedArray(this.array.slice(-(typeof cnt === 'string' ? Number.parseInt(cnt) : cnt)));
	}

	/**
	 * 每一项添加前缀，返回复制的数组
	 */
	prefix(p: string | ((v: string, i: number) => string)) {
		return new WrappedArray(this.array.map((i) => p + i));
	}
	/**
	 * 每一项添加后缀，返回复制的数组
	 */
	postfix(p: string | ((v: string, i: number) => string)) {
		return new WrappedArray(this.array.map((i) => p + i));
	}
	map(fn: (v: string, index: number) => string) {
		return new WrappedArray(this.array.map(fn));
	}
	[Symbol.iterator]() {
		return this.array.values();
	}

	toJsSet() {
		return new Set(this.array);
	}
	toJsArray(): readonly string[] {
		return this.array;
	}

	get length() {
		return this.array.length;
	}
}
