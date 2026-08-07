import { ErrorWithCode, ExitCode, type IErrorOptions } from '@idlebox/errors';
import { tryInspect } from '../../debugging/inspect.js';
import { prettyFormatError } from '../../error/pretty.nodejs.js';
import { isV8 } from '../../platform/os.js';
import { dispose_name } from './debug.js';

/**
 * 发生于【使用】已销毁对象时的错误
 */
export class DisposedError extends ErrorWithCode {
	constructor(message = '对象已销毁', opts: IErrorOptions = {}) {
		super(message, ExitCode.RESOURCE, opts);
	}

	// override get stack() {
	// 	return `${super.stack}\nit was disposed at:\n${this.previous.stackOnly}`;
	// }
}

export class UsageAfterDisposeError extends ErrorWithCode {
	constructor(message = '使用了已销毁的对象', disposed: DisposedError, boundary?: CallableFunction) {
		super(message, ExitCode.INVALID_STATE, { cause: disposed, boundary });
	}
}

const lineStart = /^/gm;

/**
 * Error when call dispose() twice
 */
export class DuplicateDisposeError extends ErrorWithCode {
	override cause!: DisposedError;

	constructor(
		public readonly object: any,
		previous: DisposedError,
	) {
		const old = Error.stackTraceLimit;
		Error.stackTraceLimit = Number.MAX_SAFE_INTEGER;

		const name = dispose_name(object, 'UnknownDisposable');

		super(`Object [${name}] has already disposed`, ExitCode.DUPLICATE, { cause: previous });

		Error.stackTraceLimit = old;
	}

	public consoleWarning() {
		try {
			if (isV8) {
				console.error('\x1B[48;5;1m  DisposedWarning  \x1B[0m DUPLICATE DISPOSE');
				const colorBlock = `\x1B[48;5;238m \x1B[0m `;
				console.error('\x1B[48;5;14m ● \x1B[0;38;5;4m first   dispose\x1B[0m');
				console.error(prettyFormatError(this.cause, false).replace(lineStart, colorBlock));
				console.error('\x1B[48;5;14m ● \x1B[0;38;5;4m current dispose\x1B[0m');
				console.error(prettyFormatError(this, false).replace(lineStart, colorBlock));
				console.error('\x1B[48;5;14m ● \x1B[0;38;5;4m the object\x1B[0m');
				console.error(tryInspect(this.object, { colors: true }).replace(lineStart, colorBlock));
				console.error('');
			} else {
				console.error('[DisposedWarning] DUPLICATE DISPOSE');
				console.error(' * first   dispose:%O', this.cause);
				console.error(' * current dispose:%O', this);
				console.error(' * the object: %O', this.object);
			}
		} catch (e) {
			console.error('Failed to create console warning for duplicate dispose', e);
			console.error('');
		}
	}

	is(other: unknown): other is DuplicateDisposeError {
		return other instanceof DuplicateDisposeError;
	}
}
