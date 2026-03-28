import type { MessagePort } from 'node:worker_threads';

export interface IImportOptions {
	/**
	 * 额外增加ts文件，指定的文件也会被编译但不会主动import，同时开启esbuild的splitting选项
	 */
	readonly entries?: readonly string[];
	readonly cache?: boolean;
	readonly write?: boolean;
}
export enum DebugMessageKind {
	hook = 'hook',
	verbose = 'verbose',
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
export interface IInitializeMessage {
	readonly type: 'initialize';
}

export type IAddFileResponse = IAddFileSuccessResponse | IAddFileErrorResponse;
type IAddFileSuccessResponse = {
	readonly type: 'compiled';
	readonly tsFile: string;
	readonly success: true;
	readonly buildInfo: IEsbuildResultInfo;
	readonly options: IImportOptions;
};

interface IAddFileErrorResponse {
	readonly type: 'compiled';
	readonly tsFile: string;
	readonly options: IImportOptions;
	readonly success: false;
	readonly message: string;
	readonly stack: string;
}

export interface IEsbuildResultInfo {
	/**
	 * 主入口对应的输出文件(url形式)
	 */
	readonly resultEntryFile: string;
	/**
	 * 编译过程用到的文件列表(绝对路径)
	 */
	readonly inputFiles: string[];
	/**
	 * 输出到输入映射(url形式)
	 */
	readonly outputToEntry: Record<string, string>;
}
// export interface IImportedMessage {
// 	readonly type: 'imported';
// 	readonly quit: boolean;
// }
export interface InitializeData {
	readonly port: MessagePort;
	readonly inspectMode: boolean;
	readonly writeTempFiles: boolean;
	readonly earlyLoaderEntry: string | false;
}

export interface IAddFileRequest {
	readonly type: 'compile';
	readonly options: IImportOptions;
	readonly tsFile: string;
}

export interface IQuitMessage {
	// 主线程通知worker退出
	readonly type: 'quit';
}

export interface IPingMessage {
	readonly type: 'ping';
	readonly id: number;
}

export interface IPongMessage {
	readonly type: 'pong';
	readonly id: number;
}

export interface IRefreshMessage {
	readonly type: 'refresh';
}

export function isTypeOf<T extends AnyMessage['type']>(data: any, type: T): data is Extract<AnyMessage, { type: T }> {
	return data?.type === type;
}

export type AnyMessage =
	| ISourceMapMessage
	| IDebugMessage
	| IInitializeMessage
	| IAddFileResponse
	| IAddFileRequest
	| IPingMessage
	| IQuitMessage
	| IRefreshMessage
	| IPongMessage;
