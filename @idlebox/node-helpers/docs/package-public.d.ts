/// <reference types="node" />
import { EventEmitter } from 'events';
import { IDisposable } from '@idlebox/lifecycle';
import { Readable } from 'stream';
import { Transform } from 'stream';
import { Writable } from 'stream';

export declare class BlackHoleStream extends Writable {
    _write(_chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void;
}

export declare class CollectingStream extends Writable {
    private buffer;
    private _promise?;
    constructor(sourceStream?: NodeJS.ReadableStream);
    _write(chunk: Buffer, encoding: string, callback: (error?: Error | null) => void): void;
    getOutput(): string;
    promise(): Promise<string>;
}

export declare function disposableStream<T extends Writable | Readable>(stream: T): T & IDisposable;

export declare function drainStream(stream: NodeJS.ReadableStream, size: number, start?: number, extra?: number): Promise<Buffer>;

export declare function dumpEventEmitterEmit(ev: EventEmitter): void;

export declare function exists(path: string): Promise<boolean>;

export declare function existsSync(path: string): boolean;

export declare class HexDumpLoggerStream extends Transform {
    private readonly logFn;
    private readonly prefix;
    constructor(logFn: LogFunction, prefix?: string);
    _transform(chunk: Buffer, encoding: string, callback: Function): void;
}

declare type LogFunction = (message: string, ...args: any[]) => void;

export declare class LoggerStream extends Transform {
    private readonly logFn;
    private readonly prefix;
    constructor(logFn: LogFunction, prefix?: string);
    _transform(chunk: Buffer, encoding: string, callback: Function): void;
}

export declare function nd5(data: Buffer): string;

export declare function prettyFormatError(e: Error): string;

export declare function prettyPrintError(type: string, e: Error): void;

export declare class RawCollectingStream extends Writable {
    private buffer;
    private _promise?;
    constructor(sourceStream?: NodeJS.ReadableStream);
    _write(chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void;
    getOutput(): Buffer;
    promise(): Promise<Buffer>;
}

export declare function setErrorLogRoot(_root: string): void;

export declare function sha256(data: Buffer): string;

export declare function streamHasEnd(S: NodeJS.ReadableStream | NodeJS.WritableStream): any;

export declare function streamPromise(stream: NodeJS.ReadableStream | NodeJS.WritableStream): Promise<void>;

export { }
