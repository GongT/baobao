import { EventRegister, IDisposable } from '@idlebox/common';

export interface IPCDriver extends IDisposable {
	call<T extends IMessage>(message: T): Promise<any>;
	handle(callback: (message: IMessage) => Promise<any>): void;
}

export interface IPCServerDriver extends IPCDriver {
	title: string;
	readonly onBeforeDispose: EventRegister<void>;
}

export interface IMessage {
	action: string;
}

export interface IEventMessage {
	action: 'event';
	event: string;
	payload: any;
}
export function isEventMessage(v: IMessage): v is IEventMessage {
	return v.action === 'event';
}

export interface ISubscribeMessage {
	action: 'subscribe';
	subscribe: Record<string, string[]>;
}
export function isSubscribeMessage(v: IMessage): v is ISubscribeMessage {
	return v.action === 'subscribe';
}

interface IUnsubscribeMessage {
	action: 'unsubscribe';
	subscribeId: number;
}
export function isUnsubscribeMessage(v: IMessage): v is IUnsubscribeMessage {
	return v.action === 'unsubscribe';
}

type SimpleTypes = string | Buffer | number | boolean;
export type IData = Record<string, SimpleTypes>;
interface IDataMessage {
	action: 'update';
	watchId: number;
	payload: IData;
}
export function isDataMessage(v: IMessage): v is IDataMessage {
	return v.action === 'update';
}
export function createDataMessage(id: number, data: IData): IDataMessage {
	return {
		action: 'update',
		watchId: id,
		payload: data,
	};
}

interface IDisposeMessage {
	action: 'dispose';
}
export function isDisposeMessage(v: IMessage): v is IDisposeMessage {
	return v.action === 'dispose';
}
