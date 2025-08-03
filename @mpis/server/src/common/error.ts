export class CompileError extends Error {
	constructor(
		message: string,
		public readonly output?: string,
	) {
		super(message || 'missing message');
		this.name = 'CompileError';
	}

	public override toString() {
		if (this.output) {
			return `${this.output}\n\n${this.message}`;
		} else {
			return `${this.message} / ** no output **`;
		}
	}
}
