export interface ICommandDefine {
	/**
	 * 多行详细帮助信息
	 */
	readonly help: string;
	/**
	 * 紧接在命令后面的参数
	 */
	readonly usage: string;
	/**
	 * usage后面的简短说明
	 */
	readonly description: string;
	/**
	 * 独特命令行参数
	 */
	readonly args: Readonly<IArgDefineMap>;
	/**
	 * 通用命令行参数
	 */
	readonly commonArgs?: Readonly<IArgDefineMap>;
	/**
	 * 是否有位置参数（默认false）
	 */
	readonly positional?: boolean;
	/**
	 * xxx --help 时隐藏
	 */
	readonly isHidden?: boolean;
}

export interface ICommandDefineWithCommand extends ICommandDefine {
	readonly command: string;
}

export type IArgDefine = {
	/**
	 * 为false时在后面加一个 <value>
	 */
	readonly flag: boolean;
	readonly description: string;

	readonly isHidden?: boolean;
	/**
	 * 为true时添加到usage最前面
	 */
	readonly usage?: boolean;
};

export type IArgDefineMap = Record<`-${string}`, IArgDefine>;
