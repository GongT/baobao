export enum ClosedBy {
	NotClosed,

	/**
	 * 传出的流被外部关闭
	 */
	Consumer = 1,

	/**
	 * 资源自身出问题，例如文件被删除，或者程序异常退出
	 */
	Target = 2,

	/**
	 * 调用了close（或dispose）
	 */
	Self = 4,
}
