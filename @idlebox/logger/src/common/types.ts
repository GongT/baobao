export enum LogTag {
	fatal = "fatal",
	error = "error",
	warn = "warn",
	info = "info",
	success = "success",
	debug = "debug",
	verbose = "verbose",
}

export interface IMyDebug {
	(messages: readonly string[] | string, ...args: readonly any[]): void;
}

export interface IMyDebugWithControl extends IMyDebug {
	enable(): void;
	disable(): void;
}

export type IBasicLogger = Record<LogTag, IMyDebugWithControl>;
