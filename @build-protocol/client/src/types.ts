export enum BuildEvent {
	Start = "start",
	Success = "success",
	Failed = "failed",
}

export interface IMessageObject {
	readonly __brand__: unique symbol;
	event: BuildEvent;

	/**
	 * 初始化时传入的title，用于调试时辨别
	 */
	title: string;

	/**
	 * 发出此消息的进程 ID
	 */
	pid: number;

	/**
	 * 从start到stop之间的输出内容，包含stop，不包含start
	 */
	output?: string;

	/**
	 * 一行成功消息（替代默认的“build success”）
	 */
	message?: string;
}
