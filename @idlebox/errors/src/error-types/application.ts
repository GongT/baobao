import { ExitCode } from '../codes/wellknown-exit-codes.js';
import { ErrorWithCode, firstLine } from '../common/base.js';
import { humanReadable } from '../common/human-readable.js';
import type { IErrorOptions } from '../common/type.js';
import type { Signals } from './nodejs.js';

/**
 * 程序因为正常运行结束而退出
 * catch到此错误时应直接重新抛出，不应做其他处理（也不应该忽略）
 */
export class Exit extends ErrorWithCode {
	constructor(code: number, opts?: IErrorOptions) {
		super('programatic exit', code, opts);
	}

	static TRACE_CONSTRUCTION = false;

	override get stack() {
		let r = `程序按要求退出，返回值为${this.code}。你不应看到此错误：说明有try-catch捕获此异常后未重新抛出。`;
		r += (new Error().stack || '').replace(firstLine, '此日志产生于：');
		r += (this.stack || '').replace(firstLine, '错误对象构造于：');
		return r;
	}

	override get message() {
		return this.stack;
	}

	override [humanReadable]() {
		return this.stack;
	}
}

export class Quit extends Exit {
	constructor(opts?: IErrorOptions) {
		super(ExitCode.SUCCESS, opts);
	}
}

/**
 * SIGINT (Ctrl+C)
 * SIGTERM
 */
export class InterruptError extends ErrorWithCode {
	constructor(
		public readonly signal: Signals,
		opts?: IErrorOptions,
	) {
		super(`interrupt by signal ${signal}`, ExitCode.INTERRUPT, opts);
	}

	override [humanReadable]() {
		return `程序被信号 ${this.signal} 异常中断`;
	}
}

/**
 * 由于错误的参数、配置导致错误
 * 非程序问题
 */
export class UsageError extends ErrorWithCode {
	constructor(message: string, opts?: IErrorOptions) {
		super(message, ExitCode.USAGE, opts);
	}

	override [humanReadable]() {
		return `参数错误: ${this.message}\n  - 此为非程序性错误，使用 --help 查看帮助`;
	}
}
