export enum BuildEvent {
	Start = 'start',
	Success = 'success',
	Failed = 'failed',
}

export interface IMessageObject {
	__brand__: 'IMessageObject';
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
}
