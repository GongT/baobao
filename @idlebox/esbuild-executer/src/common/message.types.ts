import type { MessagePort } from 'node:worker_threads';

export interface IExecuteOptions {
	/**
	 * 额外增加ts文件，指定的文件也会被编译但不会主动import，同时开启esbuild的splitting选项
	 * 默认import main后删除hook，如果设置了这个选项，则不会删除hook
	 */
	readonly entries?: readonly string[];
}
export interface ISourceMapMessage {
	readonly type: 'source-map';
	readonly fileUrl: string;
	readonly sourceMap: Uint8Array;
}
export interface IDebugMessage {
	readonly type: 'debug';
	readonly message: string;
	readonly kind: 'import' | 'esbuild' | 'worker' | 'resolve' | 'output';
}
export interface IWarningMessage {
	readonly type: 'warning';
	readonly message: string;
}
export interface IErrorMessage {
	readonly type: 'error';
	readonly message: string;
	readonly stack: string;
}
export interface IInitializeMessage {
	readonly type: 'initialize';
}
export interface InitializeData {
	options: IExecuteOptions;
	tsFile: string;
	port: MessagePort;
}
