import { objectName } from '../_tools/object-name.js';
import { ExitCode } from '../codes/wellknown-exit-codes.js';
import { ErrorWithCode, TypeErrorWithCode } from '../common/base.js';
import type { IErrorOptions } from '../common/type.js';

/**
 * 由于程序出现bug导致的各类异常
 */
export abstract class ProgramError extends ErrorWithCode {
	constructor(message: string, opts?: IErrorOptions) {
		super(message, ExitCode.PROGRAM, opts);
	}
}

export class NotImplementedError extends ProgramError {
	constructor(message: string = '此功能未实现', opts?: IErrorOptions) {
		super(message, opts);
	}
}

export class SoftwareDefectError extends ProgramError {}

export class ImpossibleError extends SoftwareDefectError {
	constructor(message: string = '代码理应无法到达此处', opts?: IErrorOptions) {
		super(message, opts);
	}
}

export class DuplicateCallError extends ProgramError {
	constructor(fn: string | Function, opts?: IErrorOptions) {
		let message;
		if (typeof fn === 'function') {
			const name = objectName(fn);
			if (!name) throw new SoftwareDefectError('DuplicateCallError 如果传入函数，则必须是命名函数');
			message = `重复调用 ${name}`;
		} else {
			message = `重复调用 ${fn}`;
		}
		super(message, opts);
	}
}

export class Assertion extends SoftwareDefectError {
	static ok(value: unknown, message: string = '断言失败', opts?: IErrorOptions): asserts value {
		if (!value) {
			if (!opts?.boundary) {
				if (!opts) opts = {};
				opts.boundary = Assertion.ok;
			}
			throw new SoftwareDefectError(`${message}: 应为真值, 实际为${typeof value}类型的 "${value}"`, opts);
		}
	}
}

interface IVariableTypeErrorOptions extends IErrorOptions {
	Expected?: Function;
	variableName?: string;
}

export class VariableTypeError extends TypeErrorWithCode {
	public readonly ExpectedClass?: Function;

	constructor(
		public readonly object: any,
		{ Expected, variableName = '变量', ...opts }: IVariableTypeErrorOptions = {},
	) {
		let message = '';
		if (Expected) {
			message += `应是 ${Expected.name}`;
		}

		const Actual = object.constructor;
		if (message) {
			message += ', 实际是 ';
		} else {
			message += '不能是 ';
		}
		message += Actual.name;

		super(`${object}的类型${message}`, ExitCode.PROGRAM, opts);
	}
}

export class InvalidStateError extends ProgramError {
	constructor(message: string = '程序状态机异常', opts?: IErrorOptions) {
		super(message, opts);
	}
}
