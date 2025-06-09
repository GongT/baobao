export class CompileError extends Error {
	constructor(
		title: string,
		message: string,
		public readonly output?: string,
	) {
		const m = `${title} compile failed`;
		super(message ? `${m}: ${message}` : m);
		this.name = 'CompileError';
		this.stack = this.message;
	}

	public override toString() {
		if (this.output) {
			return `${this.output}\n\n${this.message}`;
		} else {
			return `${this.message} / ** no output **`;
		}
	}
}
