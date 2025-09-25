/// <reference path="../typings.d.ts" />

declare global {
	interface ErrorConstructor {
		stackTraceLimit?: number;
		captureStackTrace(object: any, boundary?: Function): void;
	}
}
