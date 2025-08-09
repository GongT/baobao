import { tryInspect } from '../../debugging/tryInspect.js';
import { getErrorFrame } from '../../error/getFrame.js';
import { prettyFormatError } from '../../error/pretty.js';
import type { StackTraceHolder } from '../../error/stackTrace.js';

/**
 * Error when call dispose() twice
 */
export class DisposedError extends Error {
	public readonly inspectString: string;
	constructor(
		object: any,
		public readonly previous: StackTraceHolder,
	) {
		const insp = tryInspect(object);

		const old = Error.stackTraceLimit;
		Error.stackTraceLimit = Number.MAX_SAFE_INTEGER;

		super(`Object [${insp}] has already disposed ${getErrorFrame(previous, 2)}.`);

		Error.stackTraceLimit = old;

		this.inspectString = insp;
		this.name = 'Warning';

		this.tryCreateConsoleWarning().catch(() => {});
	}

	public async tryCreateConsoleWarning() {
		console.error('DisposedWarning: duplicate dispose.');
		console.error(' * first   dispose:\n%s', prettyFormatError(this.previous, false));
		console.error(' * current dispose:\n%s', prettyFormatError(this, false));
		console.error(' * Object: %s', this.inspectString);
	}
}

export function isDisposedError(error: any): boolean {
	return error instanceof DisposedError;
}
