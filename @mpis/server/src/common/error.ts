export class CompileError extends Error {
	constructor(
		title: string,
		public readonly output: string,
	) {
		super(`${title} compile failed`);
		this.name = 'CompileError';
		this.stack = this.message;
	}

	public override toString() {
		return `${this.output}\n\n${this.message}`;
	}
}
