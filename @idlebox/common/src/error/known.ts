import { isNative } from '../platform/os';

interface ErrorOptions {
	cause?: unknown;
}

abstract class KnownErrorAbstract extends Error {
	protected static debugMode: boolean = false;
	static debug(enabled: boolean = true) {
		KnownErrorAbstract.debugMode = enabled;
	}
	static is(e: any): e is KnownErrorAbstract {
		return e instanceof KnownErrorAbstract;
	}
}

class KnownErrorNode extends KnownErrorAbstract {
	constructor(message: string, consopt?: ErrorOptions) {
		if (KnownErrorAbstract.debugMode) {
			super(message, consopt);
		} else {
			const limit = (Error as any).stackTraceLimit;
			(Error as any).stackTraceLimit = 0;
			super(message, consopt);
			(Error as any).stackTraceLimit = limit;
			this.stack = message;
		}
	}
}

class KnownErrorCommon extends KnownErrorAbstract {
	constructor(message: string, consopt?: ErrorOptions) {
		super(message, consopt);
		if (!KnownErrorAbstract.debugMode) {
			this.stack = message;
		}
	}
}

export const KnownError = isNative ? KnownErrorNode : KnownErrorCommon;
