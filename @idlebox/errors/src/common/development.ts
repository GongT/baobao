import { ExitCode } from '../codes/wellknown-exit-codes.js';
import { ErrorWithCode, type IErrorOptions } from './base.js';

export abstract class ProgramError extends ErrorWithCode {
	constructor(message: string, opts?: IErrorOptions) {
		super(message, ExitCode.PROGRAM, opts);
	}
}

export class NotImplementedError extends ProgramError {}

export class SoftwareDefectError extends ProgramError {}

export class Assertion extends SoftwareDefectError {
	static ok(value: unknown, message: string = 'Assertion failed', opts?: IErrorOptions): asserts value {
		if (!value) {
			if (!opts?.boundary) {
				if (!opts) opts = {};
				opts.boundary = Assertion.ok;
			}
			throw new SoftwareDefectError(`${message}: value should be truthy, got ${typeof value} (${value})`, opts);
		}
	}
}
