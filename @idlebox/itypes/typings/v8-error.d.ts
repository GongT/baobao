declare interface ErrorConstructor {
	captureStackTrace(targetObject: Object, constructor?: Function): void;
	stackTraceLimit: number;
}

// declare namespace NodeJS {
// 	type Signals = string;
// 	interface ErrnoException extends Error {}
// }
