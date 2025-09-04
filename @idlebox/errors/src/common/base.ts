function noop() {}

const replaceStackTrace = Error.captureStackTrace ?? noop;

export class NotError extends Error {
	constructor(extra_message: string = '') {
		super(`你不应该看到此消息: ${extra_message}`);
	}
	override get stack() {
		return this.message;
	}
}

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

/**
 * Error when something.cancel() is called
 * @public
 */
export class CanceledError extends Error {
	constructor() {
		super('Canceled');
	}

	static is(e: unknown): e is CanceledError {
		return e instanceof CanceledError;
	}
}

/**
 * Error when something timeout
 * @public
 */
export class TimeoutError extends Error {
	constructor(ms: number, what = 'no response') {
		super(`Timeout: ${what} in ${ms}ms`);
	}

	static is(error: unknown): error is TimeoutError {
		return error instanceof TimeoutError;
	}
}
