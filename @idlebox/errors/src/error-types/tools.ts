import { ExitCode } from '../codes/wellknown-exit-codes.js';
import { ErrorWithCode } from '../common/base.js';
import { humanReadable, type IHumanReadable } from '../common/human-readable.js';
import type { IErrorOptions } from '../common/type.js';

/**
 * 发生本程序主动发起的取消行为时
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
		return '操作已应要求而取消';
	}
}

/**
 * 某种操作超时
 *
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
