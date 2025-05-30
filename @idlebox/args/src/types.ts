import type { IArgsReaderApiBase } from './arg-parser/type.js';
import type { IShared } from './library/token.js';

/**
 * Argument 是一个字符串，表示命令行参数的一个单元
 * 例如：`--verbose`、`-abc=xyz`、`value` 等
 */
export type IArgument = string;
export type IArgumentList = readonly IArgument[];

/**
 * Token 是一个命令行参数的解析结果
 * 它可以是一个标志（--flag / -a）、一个值（value）或一个带值的标志（--flag=value）
 * 多个短标志需要分开成多个 Token
 * 例如：`--verbose` 是一个Token，`-abc=xyz` 是 `-a` `-b` `-c=xyz` 三个Token
 */
type AnyToken = IFlag | IValue | IFlagValue | IDoubleDash;
export type IToken<Kind extends TokenKind | unknown = unknown> = Kind extends TokenKind.Flag
	? IFlag
	: Kind extends TokenKind.Value
		? IValue
		: Kind extends TokenKind.Both
			? IFlagValue
			: Kind extends TokenKind.DoubleDash
				? IDoubleDash
				: AnyToken;
export type ITokens = readonly IToken[];

export enum TokenKind {
	Flag = 0,
	Value = 1,
	Both = 2,
	DoubleDash = 3,
}

export interface IFlag extends IShared {
	readonly kind: TokenKind.Flag;
	/**
	 * 标志的名称，例如 verbose 或 v
	 * 如果是短标志，则 short 为 true
	 */
	readonly name: string;
	readonly short: boolean;
}
export interface IValue extends IShared {
	readonly kind: TokenKind.Value;
	readonly value: string;
}
export interface IFlagValue extends IShared {
	readonly kind: TokenKind.Both;
	readonly name: string;
	readonly short: boolean;
	readonly value: string;
}
export interface IDoubleDash extends IShared {
	readonly kind: TokenKind.DoubleDash;
}

/**
 * Parameter 是一组关联token
 * 每个解析结果都是一个Parameter，其中包含本次解出的所有token
 * 例如：`-abcde=123 --debug` 使用 `-d, --debug` 解析出 `-d` `--debug` 两个token
 */
export type ParameterDefinition = ParamDefinePosition | ParamDefineFlag | ParamDefineCommand;
export type ParamDefinePosition = readonly [number, number];
export type ParamDefineFlag = string | readonly string[];
export type ParamDefineCommand = { /* 子命令层级，从1开始 */ level: number; commands: readonly string[] };

export enum ParamKind {
	unknown = 0,
	/**
	 * 位置参数，这种参数最多只能有一个
	 * 每个token都只能是value
	 */
	positional = 1,
	/**
	 * 没有值的标志参数，例如 --verbose -v
	 */
	flag = 2,
	/**
	 * 带值选项参数，例如 --option 1 -D=2
	 */
	option = 3,
	/**
	 * 子命令参数，例如 git commit 中的commit
	 * 必然只有一个token，且一定是value
	 */
	sub_command = 4,
}

export interface IParameter<TokenType = TokenKind> {
	readonly kind: ParamKind;

	/**
	 * 类似 --xxx:-x / 0:2 的字符串，用来防止多次调用方式不同
	 */
	readonly _id: string;

	/**
	 * 绑定的token
	 */
	readonly tokens: readonly IToken<TokenType>[];

	/**
	 * 实际传入的flag参数
	 * flag如 ["--xxx", "-x"]
	 * value范围如 [1, 2]
	 */
	readonly definition: ParameterDefinition;

	// private readonly parser: IArgsReaderApi;
	/**
	 * 保存的调用栈，用于其他调用出现冲突时能同时找到两次调用
	 */
	// private readonly firstUsageStack: StackTrace;
}

/**
 * 参数解析器构造函数
 */
export interface IArgsReaderApiConstructor {
	new (argv: IArgumentList): IArgsReaderApi;
}

export interface ISubArgsReaderApi<T extends string = string> extends IArgsReaderApiBase {
	/**
	 * 当前命令
	 */
	readonly value: T;
	/**
	 * 当前命令所在的位置
	 */
	readonly position: number;
}

export interface IArgsReaderApi extends IArgsReaderApiBase {
	/**
	 * 获取剩余未匹配的参数
	 */
	unused(): string[];
}
