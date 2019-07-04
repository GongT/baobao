import { getErrorFrame } from '../../../basic-helpers/src/error/getFrame';
import { tryInspect } from '../../../basic-helpers/src/object/tryInspect';

export class DisposedError extends Error {
	constructor(object: any, previous: Error) {
		super(`Object [${tryInspect(object)}] has already disposed at ${getErrorFrame(previous, 2)}.`);
		this.name = 'Warning';
	}
}

export function isDisposedError(error: any): boolean {
	return error instanceof DisposedError;
}
