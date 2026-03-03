import { ExitCode } from '../codes/wellknown-exit-codes.js';
import { ErrorWithCode, humanReadable, type IErrorOptions } from './base.js';

/**
 * 程序因为正常运行结束而退出
 * catch到此错误时应直接重新抛出，不应做其他处理
 */
export class Exit extends ErrorWithCode {
	constructor(code: number, opts?: IErrorOptions) {
		super(`process exit with code ${code}`, code, opts);
	}
}

/**
 * SIGINT (Ctrl+C)
 * SIGTERM
 */
export class InterruptError extends ErrorWithCode {
	constructor(
		public readonly signal: NodeJS.Signals,
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
 */
export class UsageError extends ErrorWithCode {
	constructor(message: string, opts?: IErrorOptions) {
		super(message, ExitCode.USAGE, opts);
	}

	override [humanReadable]() {
		return `参数错误: ${this.message}\n  - 此为非程序性错误，使用 --help 查看帮助`;
	}
}
