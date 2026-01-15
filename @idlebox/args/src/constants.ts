export enum TokenKind {
	Flag = 0,
	Value = 1,
	Both = 2,
	DoubleDash = 3,
}

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
