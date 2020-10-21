const canceledName = 'Canceled';

/**
 * Error when cancel() is called
 * @public
 */
export class CanceledError extends Error {
	constructor() {
		super(canceledName);
	}
}

/** @public */
export function isCanceledError(error: any): boolean {
	return error instanceof CanceledError;
}
