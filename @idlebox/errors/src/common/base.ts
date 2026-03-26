import { humanReadable, type IHumanReadable } from './human-readable.js';
import type { IErrorOptions } from './type.js';
import { captureStackTrace } from './v8.js';

/**
 * 最基本的错误类型
 * 其他所有错误的基类
 * @abstract
 */
export class ErrorWithCode extends Error implements IHumanReadable {
	constructor(
		message: string,
		public readonly code: number,
		opts?: IErrorOptions,
	) {
		super(message, opts);

		captureStackTrace(this, opts?.boundary ?? this.constructor);
	}

	public override get name() {
		return this.constructor.name;
	}

	[humanReadable]() {
		let msg: string;
		if (this.code === 0) {
			msg = '未发生异常';
		} else {
			msg = `异常状态 [${this.code}]`;
		}
		return `${msg}\n  - 但是你不应该看到此信息，开发者忘记处理此种情况`;
	}
}

/**
 * 同时具有Error和TypeError特征的错误类型
 */
export class TypeErrorWithCode extends ErrorWithCode {
	static override [Symbol.hasInstance](instance: any) {
		if (typeof instance !== 'object' || !instance) {
			return false;
		}
		if (instance instanceof TypeError) {
			return true;
		}
		if (Function.prototype[Symbol.hasInstance].call(this, instance)) {
			return true;
		}
		return false;
	}
}
