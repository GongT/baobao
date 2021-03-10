/// <reference types="node" />
/// <reference lib="dom" />
import { Baobab } from 'baobab';
import { BrowserWindow } from 'electron';
import { Cursor } from 'baobab';
import { Disposable } from '@idlebox/common';
import { Emitter } from '@idlebox/common';
import type EventEmitter from 'node:events';
import { EventRegister } from '@idlebox/common';
import { IDisposable } from '@idlebox/common';
import { Watcher } from 'baobab';

export declare function createDataMessage(id: number, data: IData): IDataMessage;

export declare function createMaster(options?: Partial<IOptions>): StateMaster;

export declare function createSameProcessChild(title: string): IPCDriver;

export declare function createSameProcessMain(title: string): SameProcessMain;

export declare function createSlave(channel: IPCDriver): StateSlave;

export declare class ElectronIPCMain extends Disposable implements IPCServerDriver {
    private readonly channel;
    private readonly browserWindow;
    protected handlerHasRegister: boolean;
    private static duplicateCheck;
    constructor(channel: string, browserWindow: BrowserWindow);
    get title(): string;
    call<T extends IMessage>(message: T): Promise<any>;
    handle(callback: IMessageHandlerInternal): void;
}

export declare class ElectronIPCRender extends Disposable implements IPCServerDriver {
    private readonly channel;
    protected handlerHasRegister: boolean;
    readonly title: string;
    constructor(channel: string);
    call<T extends IMessage>(message: T): Promise<any>;
    handle(callback: IMessageHandlerInternal): void;
}

declare class EventHelper<T> {
    private readonly id;
    private readonly channel;
    readonly _onChange: Emitter<T>;
    readonly onChange: EventRegister<T>;
    constructor(id: number, channel: IPCDriver);
    stop(): void;
    dispose(): Promise<void>;
}

export declare type IData = Record<string, SimpleTypes>;

declare interface IDataMessage {
    action: 'update';
    watchId: number;
    payload: IData;
}

declare interface IDisposeMessage {
    action: 'dispose';
}

export declare interface IEventMessage {
    action: 'event';
    event: string;
    payload: any;
}

export declare interface IMessage {
    action: string;
}

export declare type IMessageHandlerInternal = (message: IMessage) => Promise<any>;

declare interface IOptions {
    development: boolean;
    defaultState: any;
}

export declare interface IPCDriver extends IDisposable {
    call<T extends IMessage>(message: T): Promise<any>;
    handle(callback: IMessageHandlerInternal): void;
}

export declare interface IPCServerDriver extends IPCDriver {
    title: string;
    readonly onBeforeDispose: EventRegister<void>;
}

export declare interface IProcessSlice extends Pick<EventEmitter, 'addListener' | 'removeListener'> {
    send(message: any, callback?: (error: Error | null) => void): boolean;
}

export declare type IRawMessage = IRawMessageReply | IRawMessageSend;

export declare interface IRawMessageReply {
    __messageKind: string;
    reply: true;
    guid: number;
    content?: any;
    error?: {
        message: string;
        stack?: string;
    };
}

export declare interface IRawMessageSend {
    __messageKind: string;
    reply: false;
    guid: number;
    message: IMessage;
}

export declare function isDataMessage(v: IMessage): v is IDataMessage;

export declare function isDisposeMessage(v: IMessage): v is IDisposeMessage;

export declare function isEventMessage(v: IMessage): v is IEventMessage;

export declare function isSubscribeMessage(v: IMessage): v is ISubscribeMessage;

export declare interface ISubscribeMessage {
    action: 'subscribe';
    subscribe: Record<string, string[]>;
}

export declare function isUnsubscribeMessage(v: IMessage): v is IUnsubscribeMessage;

declare interface IUnsubscribeMessage {
    action: 'unsubscribe';
    subscribeId: number;
}

export declare abstract class NodeIPCBase extends Disposable implements IPCDriver {
    readonly title: string;
    protected readonly channel: IProcessSlice;
    protected handler?: (message: IMessage) => void | Promise<void>;
    constructor(title: string, channel: IProcessSlice);
    protected handleMessage(msg: IRawMessageSend): void;
    call<T extends IMessage>(message: T): Promise<any>;
    handle(callback: IMessageHandlerInternal): void;
}

export declare class NodeIPCChild extends NodeIPCBase implements IPCDriver {
    constructor(title?: string);
}

export declare class NodeIPCMain extends NodeIPCBase implements IPCServerDriver {
    constructor(title: string, channel: IProcessSlice);
}

declare class RawMessageHandler {
    private wait;
    send(message: IMessage): [
        IRawMessageSend,
        Promise<any>
    ];
    reply(original: IRawMessageSend, replyData: any): IRawMessageReply;
    recv(data: IRawMessage): IMessage | null;
    private gotReply;
}

export declare const rawMessageHandler: RawMessageHandler;

export declare class SameProcessMain extends Disposable implements IPCServerDriver {
    readonly title: string;
    protected mHandler?: IMessageHandlerInternal;
    protected cHandler?: IMessageHandlerInternal;
    constructor(title: string);
    call<T extends IMessage>(message: T): Promise<any>;
    handle(callback: IMessageHandlerInternal): void;
    dispose(): void;
    fork(): IPCDriver;
}

declare type SimpleTypes = string | Buffer | number | boolean;

export declare class StateMaster {
    readonly state: Baobab;
    private readonly children;
    private eventHandlers;
    constructor(state: Baobab);
    attach(child: IPCServerDriver): void;
    on(eventName: string, callback: (payload: any, state: StateModifier) => void | Promise<void>): void;
    private handle;
    protected subscribe(subscribe: Record<string, string[]>, channel: IPCServerDriver, watchList: WatchList): number;
    protected unsubscribe(subscribeId: number, watchList: WatchList): void;
}

declare type StateModifier = Pick<Cursor, 'set' | 'unset' | 'push' | 'unshift' | 'concat' | 'pop' | 'shift' | 'splice' | 'apply' | 'merge' | 'deepMerge'>;

export declare class StateSlave {
    private readonly channel;
    private subList;
    constructor(channel: IPCDriver);
    trigger(event: string, payload: any): Promise<void>;
    private handle;
    subscribe<T>(data: Record<keyof T, string[]>): Promise<Pick<EventHelper<T>, 'onChange' | 'dispose'>>;
    dispose(): Promise<void>;
}

declare type WatchList = Map<number, Watcher>;

export { }
