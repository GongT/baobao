import type { ISubArgsReaderApi, ParamDefineFlag } from '../types.js';

export interface IArgsReaderApiBase {
	/**
	 * 获取单一参数（最多只能有1个）
	 * @param name 参数定义，或别名
	 */
	single(name: ParamDefineFlag): string | undefined;

	/**
	 * 获取任意数量参数
	 * @param name 参数定义，或别名
	 */
	multiple(name: ParamDefineFlag): string[];

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
	 * 长名称可以使用 --no-flag 来使返回小于0
	 *
	 * @param name 参数定义，或别名
	 */
	flag(name: ParamDefineFlag): number;

	/**
	 * 创建子命令分析器
	 */
	command<T extends string>(commands: readonly T[]): ISubArgsReaderApi<T> | undefined;
}
