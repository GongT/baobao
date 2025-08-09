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
