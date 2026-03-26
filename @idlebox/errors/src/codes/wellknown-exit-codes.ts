export enum ExitCode {
	SUCCESS = 0,

	/**
	 * 运行时发生各种无法预料的错误，例如网络突然断开等
	 */
	EXECUTION = 1,

	/**
	 * 在不期待SIGINT、SIGTERM的情况下，收到了这些信号进而退出
	 */
	INTERRUPT = 2,

	/**
	 * 使用方式错误，例如传入了不正确的参数
	 */
	USAGE = 3,

	/**
	 * 未处理的超时
	 */
	TIMEOUT = 4,

	/**
	 * 工作状态异常
	 * 状态转移错误等
	 */
	INVALID_STATE = 5,

	/**
	 * 由于程序代码不完善导致的未知错误
	 */
	PROGRAM = 66,

	/**
	 * 由资源引起的错误，例如文件不存在、网络错误等
	 */
	RESOURCE = 100,

	/**
	 * 重复操作，例如重复调用dispose
	 */
	DUPLICATE = 101,

	/**
	 * 未曾设想的错误
	 */
	UNKNOWN = 233,
}
