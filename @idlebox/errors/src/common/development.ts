import { ExitCode } from '../codes/wellknown-exit-codes.js';
import { ErrorWithCode } from './base.js';

export abstract class ProgramError extends ErrorWithCode {
	constructor(message: string, boundary?: CallableFunction) {
		super(message, ExitCode.PROGRAM, boundary);
	}
}

export class NotImplementedError extends ProgramError {
	constructor(message: string, boundary?: CallableFunction) {
		super(message, boundary);
		this.name = 'NotImplemented';
	}
}

export class SoftwareDefectError extends ProgramError {
	constructor(message: string, boundary?: CallableFunction) {
		super(message, boundary);
		this.name = 'SoftwareDefect';
	}
}

export class Assertion extends SoftwareDefectError {
	static ok(value: unknown, message: string = 'Assertion failed', boundary?: CallableFunction): asserts value {
		if (!value) {
			throw new SoftwareDefectError(`${message}: value should be truthy, got ${typeof value} (${value})`, boundary ?? Assertion.ok);
		}
	}
}
