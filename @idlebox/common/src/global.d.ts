/// <reference types="@idlebox/itypes" />
/// <reference types="debug" />

declare interface ErrorConstructor {
	captureStackTrace: any;
	stackTraceLimit: number;
}

declare namespace NodeJS {
	type Signals = string;
	interface ErrnoException extends Error {}
}

declare interface ImportMeta {
	env?: Record<string, string>;
}
