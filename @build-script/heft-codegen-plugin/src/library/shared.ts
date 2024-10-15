import { knownLevels } from '@build-script/heft-plugin-base';

export interface ILogMessage {
	readonly type: (typeof knownLevels)[number];
	readonly message: string;
}

export enum ExecuteReason {
	NoNeed,
	NeedCompile,
	NeedExecute,
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
