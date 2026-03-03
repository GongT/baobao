import { ExitCode } from '../codes/wellknown-exit-codes.js';

function noop() {}

const replaceStackTrace = Error.captureStackTrace ?? noop;

export interface IErrorOptions {
	/**
	 * stack属性的边界函数
	 * @see {Error.captureStackTrace}
	 */
	boundary?: CallableFunction;

	/**
	 * cause属性的值
	 * @see {Error.cause}
	 */
	cause?: unknown;
}

export const humanReadable = Symbol('humanReadable');
export interface IHumanReadable {
	[humanReadable](): string;
}

export function isHumanReadableError(error: unknown): error is IHumanReadable {
	return error instanceof Object && humanReadable in error;
}

/**
 * 利用try...catch统一接口，或是用于分支条件等，未发生错误的情况
 */
export class NotError implements IHumanReadable {
	constructor(public readonly extra_message: string = '') {}

	get stack() {
		throw new Error(`NotError 未被正确捕获 [hint: ${this.extra_message}]`);
	}
	get message() {
		throw new Error(`NotError 未被正确捕获 [hint: ${this.extra_message}]`);
	}

	[humanReadable]() {
		return `你不应该看到此消息。你无需尝试处理该错误，请联系开发者。[hint: ${this.extra_message}]`;
	}
}

/**
 * @abstract
 */
export class ErrorWithCode extends Error implements IHumanReadable {
	constructor(
		message: string,
		public readonly code: number,
		opts?: IErrorOptions,
	) {
		super(message, opts);

		replaceStackTrace(this, opts?.boundary ?? this.constructor);
	}

	public override get name() {
		return this.constructor.name;
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

Object.setPrototypeOf(ErrorWithCode.prototype, Error.prototype);

/**
 * Error when something.cancel() is called
 * @public
 */
export class CanceledError extends ErrorWithCode implements IHumanReadable {
	constructor(opts?: IErrorOptions) {
		super('Canceled', ExitCode.INTERRUPT, opts);
	}

	static is(e: unknown): e is CanceledError {
		return e instanceof CanceledError;
	}

	override [humanReadable]() {
		return '操作已应用户要求而取消';
	}
}

/**
 * Error when something timeout
 * @public
 */
export class TimeoutError extends ErrorWithCode implements IHumanReadable {
	private readonly what?: string;

	constructor(
		private readonly ms: number,
		private readonly why = 'no response',
		opts?: IErrorOptions & { what?: string },
	) {
		super(`Timeout: ${why} in ${ms}ms${opts?.what ? ` (when ${opts.what})` : ''}`, ExitCode.TIMEOUT, opts);
		this.what = opts?.what;
	}

	static is(error: unknown): error is TimeoutError {
		return error instanceof TimeoutError;
	}

	override [humanReadable]() {
		return `操作超时: ${this.what ? this.what : '操作没有说明'}\n  - 时长: ${this.ms}ms\n  - 原因: ${this.why}`;
	}
}
