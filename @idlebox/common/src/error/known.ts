import { isNative } from '../platform/os';

interface ErrorOptions {
	cause?: unknown;
}

class KnownErrorNode extends Error {
	constructor(message: string, consopt?: ErrorOptions) {
		const limit = (Error as any).stackTraceLimit;
		(Error as any).stackTraceLimit = 0;
		super(message, consopt);
		(Error as any).stackTraceLimit = limit;
	}

	static is(e: any): e is KnownErrorNode {
		return e instanceof KnownErrorNode;
	}
}

class KnownErrorCommon extends Error {
	constructor(message: string, consopt?: ErrorOptions) {
		super(message, consopt);
		this.stack = message;
	}

	static is(e: any): e is KnownErrorCommon {
		return e instanceof KnownErrorCommon;
	}
}

export const KnownError = isNative ? KnownErrorNode : KnownErrorCommon;
