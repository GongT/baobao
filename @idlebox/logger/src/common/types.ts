// biome-ignore-all lint/suspicious/noTsIgnore: 兼容浏览器环境

import type { EnableLogLevel } from '../loglevels/loglevel.js';

/** @ts-ignore */
export type NodeJSReadableStream = NodeJS.ReadableStream;

/** @ts-ignore */
export type InspectContext = import('node:util').InspectContext;

export type IMyDebug<T = void> = (message: TemplateStringsArray | string, ...args: readonly any[]) => T;

export interface IMyDebugWithControl extends IMyDebug {
	enable(): void;
	disable(): void;
	readonly isEnabled: boolean;
	readonly writeLine: ILineWriter;
}

export interface IMyLoggerMethods {
	readonly fatal: IMyDebug<never>;
	readonly error: IMyDebug;
	readonly success: IMyDebug;

	readonly warn: IMyDebug;
	readonly info: IMyDebug;
	readonly log: IMyDebug;
	readonly debug: IMyDebug;
	readonly verbose: IMyDebug;
}

export interface IMyLogger extends IMyLoggerMethods {
	readonly console: IInstrestedConsole;

	readonly tag: string;
	readonly colorEnabled: boolean;

	readonly fatal: IMyDebug<never>;
	readonly error: IMyDebug;
	readonly success: IMyDebugWithControl;

	readonly warn: IMyDebugWithControl;
	readonly info: IMyDebugWithControl;
	readonly log: IMyDebugWithControl;
	readonly debug: IMyDebugWithControl;
	readonly verbose: IMyDebugWithControl;

	extend(tag: string): IMyLogger;
	enable(newMaxLevel: EnableLogLevel): void;
}

export type IDebugCommand = (object: unknown, color: boolean) => string;

export type ILineWriter = (message: string) => any;

// export interface IIntrestedConsole {
// 	assert(condition?: unknown, message?: string): void;
// 	clear(): void;
// 	log(message: string): void;
// 	group(message: string): void;
// 	groupCollapsed(message: string): void;
// 	groupEnd(): void;
// }

interface UnsupportedMethods {
	/** @deprecated 模拟console对象不支持此方法 */
	dir(item?: any, options?: InspectContext): void;
	/** @deprecated 模拟console对象不支持此方法 */
	/** @deprecated 模拟console对象不支持此方法 */
	table(tabularData?: any, properties?: string[]): void;
	/** @deprecated 模拟console对象不支持此方法 */
	profile(label?: string): void;
	/** @deprecated 模拟console对象不支持此方法 */
	profileEnd(label?: string): void;
	/** @deprecated 模拟console对象不支持此方法 */
	timeStamp(label?: string): void;
}

export interface IInstrestedConsole {
	readonly colorEnabled: boolean;

	clear(): void;

	group(message: string): void;
	groupCollapsed(message: string): void;
	groupEnd(): void;

	error(message: string): void;
	warn(message: string): void;
	info(message: string): void;
	log(message: string): void;
	debug(message: string): void;
	trace(message: string): void;
}

export interface IAbstractConsole {
	readonly colorEnabled: boolean;

	assert(condition?: unknown, ...data: any[]): void;
	clear(): void;
	count(label?: string): void;
	countReset(label?: string): void;
	dirxml(...data: any[]): void;
	error(...data: any[]): void;
	group(...data: any[]): void;
	groupCollapsed(...data: any[]): void;
	groupEnd(): void;
	info(...data: any[]): void;
	log(...data: any[]): void;
	time(label?: string): void;
	timeEnd(label?: string): void;
	timeLog(label?: string, ...data: any[]): void;
	trace(...data: any[]): void;
	warn(...data: any[]): void;
	debug(...data: any[]): void;
}

export interface IConsole extends UnsupportedMethods, IAbstractConsole {}
