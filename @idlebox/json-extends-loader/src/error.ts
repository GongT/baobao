export class NotFoundError extends Error {
	constructor(
		public readonly file: string,
		public readonly source: string
	) {
		super(`missing file: ${file}\n  from: ${source}`);
	}
}
