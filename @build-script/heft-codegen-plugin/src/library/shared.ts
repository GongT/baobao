/**
 * 这个文件的协议用于worker和主线程之间的通信
 */
import type { knownLevels } from '@build-script/heft-plugin-base';

export interface ILogMessage {
	readonly type: (typeof knownLevels)[number];
	readonly message: string;
}

export enum ExecuteReason {
	NoNeed = 0,
	NeedCompile = 1,
	NeedExecute = 2,
}

export interface IOutputProtocol extends ILogMessage {
	readonly kind: 'log';
}
export interface ISuccessResultProtocol {
	readonly kind: 'success';
	files: string[];
	changed: boolean;
}

export interface IErrorResultProtocol {
	readonly kind: 'error';
	error: Record<string, any>;
}

export type IProtocolMessage = IOutputProtocol | ISuccessResultProtocol | IErrorResultProtocol;

export function sendOutputMessage(message: IProtocolMessage): void {
	console.log(JSON.stringify(message));
}
