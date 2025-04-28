import type { IOutputShim } from '@build-script/heft-plugin-base';
import { loadInheritedJson } from '@idlebox/json-extends-loader';
import { readFileSync } from 'node:fs';

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
		public readonly projectRoot: string
	) {
		/*
		 *	读取文件内容并按行分割，过滤掉空行
		 */
		this.referData = readFileSync(filePath, 'utf-8')
			.split('\n')
			.filter((l) => l.length > 0);
	}

	/**
	 * 将文件添加到监听列表中，如果任意文件发生更改，生成器将重新运行
	 *
	 * *注意: 如果需要监听文件夹，则必须以 / 结尾*
	 * 所有源代码（自身和 import() 的文件）将自动添加到列表中，不需要手动添加
	 *
	 * @param files 要添加到监听列表的文件
	 */
	watchFiles(...files: string[]) {
		for (const file of files) {
			this._watchFiles.add(file);
		}
	}

	/**
	 *	获取当前监听的文件列表
	 */
	get watchingFiles() {
		return this._watchFiles;
	}

	/**
	 * 加载带有 "extends" 字段的链式 JSON 文件，例如 tsconfig.json
	 */
	async readExtendsJson(file: string) {
		this.watchFiles(file);
		return loadInheritedJson(file);
	}

	/**
	 *	将文本追加到结果数组中
	 */
	append(text: string) {
		this.result.push(text);
		return text;
	}

	/**
	 * 将结果数组转换为字符串
	 */
	toString() {
		return this.result.join('\n');
	}

	/* 
		获取结果数组的大小
	*/
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
		return this.readSection(new RegExp(`^(?:export )?function ${escapeRegExp(fnname)}\\b`), /^}/, head);
	}

	/**
	 * 从当前文件中复制接口定义，接口必须以 "[export ]interface ifname {" 开头
	 */
	copyInterfaceDeclare(ifname: string, head = true) {
		this.append(this.readInterfaceDeclare(ifname, head));
	}
	readInterfaceDeclare(ifname: string, head = true) {
		return this.readSection(new RegExp(`^(?:export )?interface ${escapeRegExp(ifname)}\\b`), /^}/, head);
	}

	/**
	 * 从当前文件中复制枚举定义，枚举必须以 "[export ][const ]enum ename {" 开头
	 */
	copyEnumDeclare(ename: string, head = true) {
		this.append(this.readInterfaceDeclare(ename, head));
	}
	readEnumDeclare(ename: string, head = true) {
		return this.readSection(new RegExp(`^(?:export )?(?:const )?enum ${escapeRegExp(ename)} {`), /^}/, head);
	}

	/* 
		生成一个从指定范围的数字序列
	*/
	seq(from: number, to: number) {
		const r: string[] = [];
		for (let i = from; i <= to; i++) {
			r.push(i.toFixed(0));
		}
		return new WrappedArray(r);
	}

	/* 
		递归地减少范围内的数字，并通过映射函数生成字符串
	*/
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

	/* 
		将数组转换为以逗号分隔的字符串
	*/
	toList() {
		return this.array.join(', ');
	}

	/* 
		将数组转换为以换行符分隔的字符串
	*/
	toLines() {
		return this.array.join('\n');
	}

	/* 
		将数组转换为以竖线分隔的联合类型字符串
	*/
	toUnion() {
		return this.array.join(' | ');
	}

	/* 
		递归处理数组的子数组，并通过映射函数生成新数组
	*/
	recursion(map: (subarr: WrappedArray) => string[]) {
		const a = [];
		for (let i = 1; i < this.array.length; i++) {
			a.push(...map(this.first(i)));
		}
		return a;
	}

	/* 
		获取数组的前几个元素
	*/
	first(cnt: number | string) {
		return new WrappedArray(this.array.slice(0, typeof cnt === 'string' ? Number.parseInt(cnt) : cnt));
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
