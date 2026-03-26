import type { MessagePort } from 'node:worker_threads';

export interface IExecuteOptions {
	/**
	 * 额外增加ts文件，指定的文件也会被编译但不会主动import，同时开启esbuild的splitting选项
	 * 默认import main后删除hook，如果设置了这个选项，则不会删除hook
	 */
	readonly entries?: readonly string[];
}
export enum DebugMessageKind {
	import = 'hook',
	esbuild = 'esbuild',
	worker = 'worker',
	resolve = 'resolve',
	output = 'output',
	error = 'error',
}

export interface ISourceMapMessage {
	readonly type: 'source-map';
	readonly fileUrl: string;
	readonly sourceMap: Uint8Array;
}
export interface IDebugMessage {
	readonly type: 'outputs';
	readonly message: string;
	readonly kind: DebugMessageKind;
}
export type IInitializeMessage =
	| {
			readonly type: 'initialize';
			readonly success: true;
			readonly entryFileUrl: string;
	  }
	| {
			readonly type: 'initialize';
			readonly success: false;
			readonly message: string;
			readonly stack: string;
	  };
export interface IQuitMessage {
	readonly type: 'quit';
}
export interface IImportedMessage {
	readonly type: 'imported';
	readonly quit: boolean;
}
export interface InitializeData {
	options: IExecuteOptions;
	tsFile: string;
	port: MessagePort;
}
