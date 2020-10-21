import { getErrorFrame } from '../../error/getFrame';
import { tryInspect } from '../../debugging/tryInspect';

/**
 * Error when call dispose() twice
 */
export class DisposedError extends Error {
	constructor(object: any, previous: Error) {
		super(`Object [${tryInspect(object)}] has already disposed at ${getErrorFrame(previous, 2)}.`);
		this.name = 'Warning';
	}
}

export function isDisposedError(error: any): boolean {
	return error instanceof DisposedError;
}
