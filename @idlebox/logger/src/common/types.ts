export type IMyDebug<T = void> = (message: TemplateStringsArray | string, ...args: readonly any[]) => T;

export interface IMyDebugWithControl extends IMyDebug {
	enable(): void;
	disable(): void;
	readonly isEnabled: boolean;
}

export enum EnableLogLevel {
	auto,
	fatal,
	error,
	warn,
	info,
	log,
	debug,
	verbose,
}

export type IMyLogger = {
	fatal: IMyDebug<never>;

	error: IMyDebug;
	success: IMyDebugWithControl;

	warn: IMyDebugWithControl;
	info: IMyDebugWithControl;
	log: IMyDebugWithControl;
	debug: IMyDebugWithControl;
	verbose: IMyDebugWithControl;

	extend: (tag: string) => IMyLogger;
	stream: NodeJS.ReadableStream;

	enable(newMaxLevel: EnableLogLevel): void;

	readonly tag: string;
	readonly colorEnabled: boolean;
};
