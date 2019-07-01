const canceledName = 'Canceled';

export function isCanceledError(error: any): boolean {
	return error instanceof Error && error.name === canceledName && error.message === canceledName;
}

export function canceled(): Error {
	const error = new Error(canceledName);
	error.name = error.message;
	return error;
}
