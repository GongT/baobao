import { isNodeJs } from '../../autoindex.js';
import { tryInspect } from '../../debugging/inspect.js';
import { getErrorFrame } from '../../error/get-frame.js';
import { prettyFormatError } from '../../error/pretty.nodejs.js';
import type { StackTraceHolder } from '../../error/stack-trace.js';
import { dispose_name } from './debug.js';

export class Disposed extends Error {
	constructor(
		message = 'Object has been disposed',
		private readonly previous: StackTraceHolder,
	) {
		super(message);
		this.name = 'DisposedError';
	}

	override get stack() {
		return `${super.stack}\nDisposed at:\n${this.previous.stack}`;
	}
}

/**
 * Error when call dispose() twice
 */
export class DuplicateDisposed extends Error {
	public readonly inspectString: string;
	constructor(
		object: any,
		private readonly previous: StackTraceHolder,
	) {
		const old = Error.stackTraceLimit;
		Error.stackTraceLimit = Number.MAX_SAFE_INTEGER;
		const stacks = getErrorFrame(previous, 2);

		const inspectString = tryInspect(object);
		const name = dispose_name(object, inspectString);

		super(`Object [${name}] has already disposed ${stacks}.`);
		this.name = 'DuplicateDisposedError';
		this.inspectString = inspectString;

		Error.stackTraceLimit = old;

		this.tryCreateConsoleWarning().catch(() => {});
	}

	public async tryCreateConsoleWarning() {
		console.error('DisposedWarning: duplicate dispose.');
		if (isNodeJs) {
			console.error(' * first   dispose:\n%s', prettyFormatError(this.previous));
			console.error(' * current dispose:\n%s', prettyFormatError(this));
		} else {
			console.error(' * first   dispose:%O', this.previous);
			console.error(' * current dispose:%O', this);
		}
		console.error(' * Object: %s', this.inspectString);
	}

	is(other: unknown): other is DuplicateDisposed {
		return other instanceof DuplicateDisposed;
	}
}
