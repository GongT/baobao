import { AppExit } from '@idlebox/common';

export class Exit extends AppExit {
	constructor(code: number) {
		super(`process exit with code ${code}`, code);
	}
}

export class InterruptError extends Error {
	constructor(public readonly signal: NodeJS.Signals) {
		super(`interrupt by signal ${signal}`);
	}
}

class ProxiedError extends Error {
	declare cause: any;

	constructor(prefix: string, original: unknown) {
		super(`${prefix}: ${get_message(original)}`, { cause: original });
		delete (this as any).stack;
	}

	override get stack(): string {
		const cause: any = this.cause;
		if (cause && 'stack' in cause) {
			const stack = cause.stack;
			if (typeof stack === 'string') {
				return this.message + '\n' + removeFirstLine(cause.stack);
			}
		}
		return `${this.message}\n  no stack available`;
	}
}

export class UnhandledRejection extends ProxiedError {
	constructor(
		reason: any,
		public readonly promise: Promise<unknown>,
	) {
		super('unhandled promise rejection', reason);
	}
}

export class UncaughtException extends ProxiedError {
	constructor(public readonly error: unknown) {
		super('uncaught exception', error);
	}
}

function get_message(reason: any): string {
	if (reason instanceof Error) {
		return reason.message;
	}
	if (reason && typeof reason === 'object' && 'message' in reason) {
		return reason.message;
	}
	return String(reason);
}

function removeFirstLine(text: string) {
	const index = text.indexOf('\n');
	if (index !== -1) {
		return text.slice(index + 1);
	}
	return text;
}
