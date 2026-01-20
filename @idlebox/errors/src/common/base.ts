function noop() {}

const replaceStackTrace = Error.captureStackTrace ?? noop;

export const humanReadable = Symbol('humanReadable');
export interface IHumanReadable {
	[humanReadable](): string;
}

export function isHumanReadableError(error: unknown): error is IHumanReadable {
	return error instanceof Object && humanReadable in error;
}

export class NotError extends Error implements IHumanReadable {
	constructor(extra_message: string = '') {
		super(`你不应该看到此消息: ${extra_message}`);
	}
	override get stack() {
		return this.message;
	}

	[humanReadable]() {
		return '你不应该看到此消息。你无需尝试处理该错误，请联系开发者。';
	}
}

/**
 * 应用程序退出
 * 此错误通常不需要输出到日志
 * @abstract
 */
export class ErrorWithCode extends Error implements IHumanReadable {
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

	[humanReadable]() {
		let msg: string;
		if (this.code === 0) {
			msg = '程序正常结束';
		} else {
			msg = `程序以非0状态正常结束，状态码：${this.code}`;
		}
		return `${msg}\n  - 但是你不应该看到此信息，开发者忘记处理此种情况`;
	}
}

/**
 * Error when something.cancel() is called
 * @public
 */
export class CanceledError extends Error implements IHumanReadable {
	constructor() {
		super('Canceled');
	}

	static is(e: unknown): e is CanceledError {
		return e instanceof CanceledError;
	}

	[humanReadable]() {
		return '操作已应用户要求而取消';
	}
}

/**
 * Error when something timeout
 * @public
 */
export class TimeoutError extends Error implements IHumanReadable {
	constructor(
		private readonly ms: number,
		private readonly why = 'no response',
		private readonly what?: string,
	) {
		super(`Timeout: ${why} in ${ms}ms${what ? ` (when ${what})` : ''}`);
	}

	static is(error: unknown): error is TimeoutError {
		return error instanceof TimeoutError;
	}

	[humanReadable]() {
		return `操作超时: ${this.what ? this.what : '操作没有说明'}\n  - 时长: ${this.ms}ms\n  - 原因: ${this.why}`;
	}
}
