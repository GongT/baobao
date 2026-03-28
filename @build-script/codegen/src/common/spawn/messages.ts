export interface IGenerateResult {
	outputs: string;
	userWatchFiles: string[];
	success: boolean;
	changes: number;
	totalFiles: number;
	error?: {
		readonly message: string;
		readonly stack?: string;
	};
}

export interface IExecuteMessage {
	type: 'execute';
}

export interface IExecuteResultMessage {
	type: 'execute-result';
	result: IGenerateResult;
}

export interface IInitializeMessage {
	type: 'initialize';
	files: string[];
	error?: {
		readonly message: string;
		readonly stack?: string;
	};
}

export type IMessage = IExecuteMessage | IExecuteResultMessage | IInitializeMessage;

export function isTypeOf<T extends IMessage>(message: unknown, type: T['type']): message is T {
	return (message as IMessage).type === type;
}

export function getTypeFilter<T extends IMessage>(type: T['type']): (message: unknown) => message is T {
	return (message: unknown): message is T => (message as IMessage).type === type;
}
