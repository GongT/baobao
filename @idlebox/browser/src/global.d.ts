/// <reference lib="DOM" />

declare interface ErrorConstructor {
	captureStackTrace: any;
	stackTraceLimit: number;
}

declare namespace NodeJS {
	type Signals = string;
	interface ErrnoException extends Error {}
}

declare interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare interface ImportMetaEnv extends Record<string, string | boolean | undefined> {
	readonly PROD: boolean;
	readonly DEV: boolean;
}
