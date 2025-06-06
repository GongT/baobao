/**
 * 应用程序退出
 *
 * 此错误通常不需要输出到日志
 */
export class AppExit extends Error {
	constructor(
		message: string,
		public readonly code?: number,
	) {
		super(message);
		this.name = 'AppExit';
	}
}
