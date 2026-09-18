import { isWindows } from '../platform/os.js';
import { normalizePath } from './normalizePath.js';

/**
 * PATH_SEPARATOR 是环境变量中表达数组时使用的分隔符。通常用于路径（尤其是Path）
 * 在 Windows 平台是 ';'，在其他平台是 ':'
 */
export const PATH_SEPARATOR = isWindows ? ';' : ':';

/**
 * 处理类似"PATH"的值
 *
 * * 路径分隔符始终是 / 而非 \
 * * 可选项目分隔符（默认根据平台是 : 或 ;）
 */
abstract class PathArrayAbstract {
	private readonly array: string[] = [];

	constructor(
		init: string | string[] = [],
		private readonly sep: string = PATH_SEPARATOR,
	) {
		if (sep.length !== 1) throw new Error(`路径分隔符必须是单个字符，不能是 "${sep}"`);
		if (init.length) {
			if (Array.isArray(init)) {
				for (const item of init) {
					this.add(item);
				}
			} else {
				this.add(init);
			}
		}
	}

	clone(): PathArrayAbstract {
		const Cls = this.constructor as any;
		return new Cls(this.array);
	}

	get size() {
		return this.array.length;
	}

	/**
	 * 添加value到数组
	 * @param value 路径，允许传入单个路径或是字符串表达的数组（/a:/b:/c）
	 * @param first 是否将路径添加到数组的开头
	 * @param force 是否强制添加路径，即使它已经存在（将会移动到开头或末尾）
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

	/**
	 * 从对象中删除给定的路径，支持传入单个路径或是字符串表达的数组（/a:/b:/c）
	 */
	delete(value: string) {
		let anyRet = false;
		for (const part of this.split(value)) {
			anyRet = anyRet || this._delete(part);
		}
		return anyRet;
	}

	/**
	 * 从对象中删除给定的标准化路径
	 *
	 * 如果有重复项，会删除全部
	 * @returns 是否成功删除了至少一个路径
	 */
	protected _delete(normalizedPath: string) {
		let found = false;
		while (true) {
			const index = this.array.indexOf(normalizedPath);
			if (index !== -1) {
				this.array.splice(index, 1);
				found = true;
			} else {
				break;
			}
		}
		return found;
	}

	/**
	 * 将给定的字符串按照路径分隔符拆分成数组，并对每个路径进行标准化
	 *
	 * 不修改当前对象
	 */
	split(value: string): string[] {
		return value.split(this.sep).map((p) => this.normalize(p));
	}

	/**
	 * 检查当前对象中是否包含给定的路径
	 */
	has(value: string) {
		return this.array.includes(this.normalize(value));
	}

	/**
	 * 将给定的路径标准化，可以是相对路径或绝对路径
	 */
	abstract normalize(path: string): string;

	/**
	 * 转换成环境变量形式的字符串
	 */
	toString(): string {
		return this.array.join(this.sep);
	}

	/**
	 * 获取当前对象的路径数组副本
	 */
	toArray(): string[] {
		return this.array.slice();
	}

	/**
	 * 递归遍历当前对象的路径数组
	 */
	[Symbol.iterator]() {
		return this.array.values();
	}

	/**
	 * 获取当前对象的路径数组的迭代器
	 */
	values() {
		return this.array.values();
	}

	/**
	 * 将给定的路径部分拼接到当前对象的**每个**路径上
	 *
	 * 返回拼接结果，不修改当前对象
	 */
	joinpath(part: string) {
		return this.array.map((p) => `${p}/${part}`);
	}

	clear() {
		this.array.length = 0;
	}
}

/**
 * 处理类似"PATH"的值，Windows模式
 *
 * * 不区分大小写
 * * 分隔符是 ;
 */
export class PathArrayWindows extends PathArrayAbstract {
	private readonly caseMap = new Map<string, string>();

	override normalize(path: string) {
		return normalizePath(path);
	}

	override clear(): void {
		super.clear();
		this.caseMap.clear();
	}

	override _add(normalizedPath: string) {
		const lcase = normalizedPath.toLowerCase();
		if (this.caseMap.has(lcase)) {
			return false;
		}
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

/**
 * 处理类似"PATH"的值，Posix模式
 *
 * * 分隔符是 :
 */
export class PathArrayPosix extends PathArrayAbstract {
	override normalize(path: string) {
		return normalizePath(path);
	}
}

const TypePathArrayAbstract = isWindows ? PathArrayWindows : PathArrayPosix;

/**
 * 根据当前平台选择合适的 PathArray 实现，Windows 平台使用 PathArrayWindows，其他平台使用 PathArrayPosix
 */
export class PathArray extends TypePathArrayAbstract {}
