function noop() {}

const replaceStackTrace = Error.captureStackTrace ?? noop;

/**
 * 应用程序退出
 * 此错误通常不需要输出到日志
 * @abstract
 */
export class ErrorWithCode extends Error {
	constructor(
		message: string,
		public readonly code: number,
		boundary?: CallableFunction,
	) {
		const { stackTraceLimit } = Error;
		Error.stackTraceLimit = 0;
		super(message);
		Error.stackTraceLimit = stackTraceLimit;

		this.name = this.constructor.name;

		replaceStackTrace(this, boundary ?? this.constructor);
	}
}
