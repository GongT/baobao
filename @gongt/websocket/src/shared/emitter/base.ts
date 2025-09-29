export interface IRemoteInfo {
	readonly methodName: string;
	readonly arguments: {
		readonly length: number;
		readonly optional: number;
	};
	readonly hasAck: boolean;
}

export abstract class SocketEmitter {
	abstract send(event: string, param: any[], info?: IRemoteInfo): void;
	abstract send_with_ack(event: string, param: any[], info?: IRemoteInfo): Promise<any>;
}
