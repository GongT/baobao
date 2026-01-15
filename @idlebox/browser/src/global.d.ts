/// <reference lib="DOM" />

declare interface ErrorConstructor {
	captureStackTrace: any;
	stackTraceLimit: number;
}

declare namespace NodeJS {
	type Signals = string;
	interface ErrnoException extends Error {}
}
