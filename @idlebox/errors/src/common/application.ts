import { ExitCode } from '../codes/wellknown-exit-codes.js';
import { ErrorWithCode } from './base.js';

/**
 * 程序因为正常运行结束而退出
 * catch到此错误时应直接重新抛出，不应做其他处理
 */
export class Exit extends ErrorWithCode {
	constructor(code: number, boundary?: CallableFunction) {
		super(`process exit with code ${code}`, code, boundary);
	}
}

/**
 * SIGINT (Ctrl+C)
 * SIGTERM
 */
export class InterruptError extends ErrorWithCode {
	constructor(
		public readonly signal: NodeJS.Signals,
		boundary?: CallableFunction,
	) {
		super(`interrupt by signal ${signal}`, ExitCode.INTERRUPT, boundary);
	}
}

/**
 * 由于错误的参数、配置导致错误
 */
export class UsageError extends ErrorWithCode {
	constructor(message: string, boundary?: CallableFunction) {
		super(message, ExitCode.USAGE, boundary);
	}
}
