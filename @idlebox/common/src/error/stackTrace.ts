export interface StackTraceHolder {
	readonly message: string;
	readonly stack: string;
	toString(): string;
}

export interface IWithStack {
	stack?: string;
}

class StackTraceHoldObject {
	private holder: any = { name: 'StackTraceHolder', message: '' };

	constructor(message: string, boundary: any = undefined) {
		this.holder.message = message;

		const old = (Error as any).stackTraceLimit;
		(Error as any).stackTraceLimit = Number.MAX_SAFE_INTEGER;

		(Error as any).captureStackTrace(this.holder, boundary);

		(Error as any).stackTraceLimit = old;
	}

	toString(): string {
		throw new Error("StackTraceHolder don't want toString()");
	}

	get message() {
		return this.holder.message;
	}

	get stack() {
		return this.holder.stack;
	}
}

let fn = createStackTraceHolder1;
if (!('captureStackTrace' in (Error as any))) {
	console.error('Error.captureStackTrace not supported on this platform. debug feature limited.');
	class StackTrace extends Error {}
	fn = ((message: string) => {
		return new StackTrace(message);
	}) as any;
}

function createStackTraceHolder1(message: string, boundary: any = createStackTraceHolder1): StackTraceHolder {
	return new StackTraceHoldObject(message, boundary);
}

export const createStackTraceHolder = fn;
