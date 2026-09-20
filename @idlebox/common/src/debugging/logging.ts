import debug from 'debug';

interface TrimmedDebugger {
	(formatter: any, ...args: any[]): void;

	enabled: boolean;
}

/** @internal */
export interface ILowLogger {
	(message: TemplateStringsArray | string, ...args: readonly any[]): void;
	readonly isEnabled: boolean;
}

/** @internal */
export type IAcceptLogger = TrimmedDebugger | ILowLogger;

/** @internal */
export function convertLog(log: IAcceptLogger): ILowLogger {
	if ('isEnabled' in log) return log;

	const shim = (message: TemplateStringsArray | string, ...args: readonly any[]) => {
		if (!log.enabled) return;

		if (Array.isArray(message)) {
			log(String.raw(message as TemplateStringsArray, ...args));
		} else {
			log(message, ...args);
		}
	};
	Object.defineProperty(shim, 'isEnabled', {
		get: () => log.enabled,
		enumerable: true,
		configurable: false,
	});
	return shim as ILowLogger;
}

/** @internal */
export function debugLogger(namespace: string): ILowLogger {
	return convertLog(debug(namespace));
}
