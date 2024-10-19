export type NameKind = string | readonly string[];
import { type IParams, ArgsReader } from './library/args-reader.js';
export { printTwoColumn } from './tools/table.js';

export function createArgsReader(argv: IParams): IArgsReaderApi {
	return new ArgsReader(argv);
}

export {
	ArgumentError,
	ConflictArgument,
	UncontinuousPositionalArgument,
	UnexpectedArgument,
} from './library/errors.js';

export interface IArgsReaderApiCreaterFunction {
	/**
	 * “构造”函数
	 * @param argv 传入的数组会被复制，因此构造后修改argv不影响当前对象
	 */
	(argv: readonly string[]): IArgsReaderApi;
}

export type ISubArgsReaderApi<T extends string = string> = IArgsReaderApi & {
	readonly value: T;
};

export interface IArgsReaderApi {
	/**
	 * 获取单一参数（最多只能有1个）
	 * @param name 参数定义，或别名
	 */
	single(name: NameKind): string | undefined;

	/**
	 * 获取任意数量参数
	 * @param name 参数定义，或别名
	 */
	multiple(name: NameKind): string[];

	/**
	 * 获取位置参数
	 * @param index 位置（从0开始）
	 */
	at(index: number): string | undefined;

	/**
	 * 获取多个位置参数
	 * 如果没有那么多参数，返回长度会小于maxCount
	 *
	 * @param index 起始位置（从0开始）
	 * @param maxCount 数量（默认全部）
	 */
	range(index: number, maxCount?: number): string[];

	/**
	 * 获取flag
	 * @param name 参数定义，或别名
	 */
	flag(name: NameKind): number;

	/**
	 * 获取剩余参数
	 */
	unused(): string[];

	/**
	 * 创建子命令分析器
	 */
	command<T extends string>(commands: readonly T[]): ISubArgsReaderApi<T> | undefined;

	/**
	 * 读取原始数据
	 * @param index
	 */
	raw(index: number): string | undefined;
}
