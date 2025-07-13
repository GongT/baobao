import type { IMyLogger } from '@idlebox/logger';

export type ErrorObject = FileErrorCollector;

class FileErrorCollector {
	public readonly messages: string[];
	public addonText: string[] = [];

	constructor(
		public readonly logger: IMyLogger,
		private readonly errors: Map<string, FileErrorCollector>,
	) {
		this.messages = [];
	}

	addon(text: string) {
		this.addonText.push(text);
	}

	emit(message: string) {
		const messages = message.split('\n');

		if (messages.length > 1) {
			for (let i = 1; i < messages.length; i++) {
				messages[i] = `    ${messages[i]}`;
			}
		}
		this.messages.push(...messages);

		return new CheckFail(this.errors);
	}

	assert(cond: boolean, message: string) {
		if (!cond) this.emit(message);
	}
}

export class ErrorCollector {
	private readonly errors = new Map<string, FileErrorCollector>();

	constructor(public readonly logger: IMyLogger) {}

	with(file: string) {
		const exists = this.errors.get(file);
		if (exists) {
			return exists;
		}
		const error = new FileErrorCollector(this.logger, this.errors);
		this.errors.set(file, error);
		return error;
	}

	getError() {
		const errCnt = this.errors.values().reduce((c, v) => c + v.messages.length, 0);
		if (errCnt === 0) {
			return;
		}
		return new CheckFail(this.errors);
	}

	throwIfErrors() {
		const e = this.getError();
		if (e) {
			throw e;
		}
	}
}

export class CheckFail extends Error {
	constructor(private readonly errors: Map<string, FileErrorCollector>) {
		super();
	}

	override get message() {
		const errCnt = this.errors.values().reduce((c, v) => c + v.messages.length, 0);
		const header = `${errCnt} errors found:`;

		let all_messages = [header];
		for (const [who, sub] of this.errors.entries()) {
			if (sub.messages.length === 0) continue;

			all_messages.push(`文件 "${who}":`);

			for (const line of sub.addonText) {
				all_messages.push(`  ${line}`);
			}

			for (const error of sub.messages) {
				all_messages.push(`  - ${error}`);
			}
		}
		this.errors.clear();
		return all_messages.join('\n');
	}
}
