export class NotFoundError extends Error {
	public readonly code = 'ENOENT';
	public override readonly name = 'NotFoundError';

	constructor(file: string, message?: string) {
		super(`file "${file}" not found${message ? `: ${message}` : ''}`);
	}
}

export class ExtendError extends NotFoundError {
	constructor(
		public readonly file: string,
		public readonly source: string,
	) {
		super(file, `extended by: ${source}`);
	}
}
