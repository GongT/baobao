const canceledName = 'Canceled';

export class CanceledError extends Error {
	constructor() {
		super(canceledName);
	}
}

export function isCanceledError(error: any): boolean {
	return error instanceof CanceledError;
}
