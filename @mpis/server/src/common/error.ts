export class CompileError extends Error {
	constructor(
		message: string,
		public readonly output?: string,
	) {
		super(message || '缺失错误信息！');
		this.name = 'CompileError';
	}

	public override toString() {
		if (this.output) {
			return `${this.output}\n\n${this.message}`;
		} else {
			return `${this.message} / ** 构建输出为空 **`;
		}
	}
}
