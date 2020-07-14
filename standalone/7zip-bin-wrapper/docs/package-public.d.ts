/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { SpawnOptions } from 'child_process';
import { Transform } from 'stream';

/** @extern */
export declare function compress(zipFile: string, sourceDir: string, ...extraSource: string[]): I7zHandler;

/** @extern */
export declare function extract(zipFile: string, targetDir: string): I7zHandler;

/** @extern */
export declare function extractSfx(sfxFile: string, targetDir: string, extraSpawn?: ExtraSpawnOptions): I7zHandler;

/** @extern */
export declare type ExtraSpawnOptions = Pick<SpawnOptions, 'cwd' | 'env' | 'uid' | 'gid' | 'shell'>;

declare class FilterStream extends Transform {
    constructor();
    _transform(chunk: Buffer | string, encoding: BufferEncoding, callback: Function): void;
}

export declare function handleOutput(stream: NodeJS.ReadableStream): FilterStream;

export declare function handleProgress(stream: NodeJS.ReadableStream, message: boolean): ProgressStream;

/** @extern */
export declare class I7zHandler extends EventEmitter {
    private readonly toRun;
    private _promise?;
    private _timer;
    private cp?;
    private _start;
    on(event: 'progress', cb: (progress: IStatusReport) => void): this;
    on(event: 'output', cb: (data: string) => void): this;
    hold(): void;
    cancel(): Promise<void>;
    get commandline(): string[];
    get cwd(): string;
    promise(): Promise<void>;
}

/** @extern */
export declare interface IStatusReport {
    messageOnly?: boolean;
    progress: number;
    message: string;
}

export declare interface IToRun {
    commandline: string[];
    cwd: string;
    execute(handleData: MessageHandler, handleStatus: ProgressHandler): ChildProcess;
}

export declare class LoggerStream extends Transform {
    private pp;
    constructor(pp: string);
    _transform(chunk: string, encoding: BufferEncoding, callback: Function): void;
}

export declare type MessageHandler = (data: string) => void;

export declare function processPromise(cp: ChildProcess, cmd: string[], cwd: string): Promise<void>;

export declare function processQuitPromise(cp: ChildProcess): Promise<void>;

/** @extern */
export declare interface ProgramError extends Error {
    __cwd: string;
    __program: string;
    __programError: boolean;
    signal: string;
    status: number;
}

export declare type ProgressHandler = (status: IStatusReport) => void;

declare class ProgressStream extends Transform {
    private readonly message;
    constructor(message: boolean);
    _transform(chunk: string, _encoding: BufferEncoding, callback: Function): void;
}

/** @extern */
export declare function sevenZip(ex: ExtraSpawnOptions, ...args: string[]): I7zHandler;

export declare function sevenZip(...args: string[]): I7zHandler;

/** @extern */
export declare function sevenZipCli(ex: ExtraSpawnOptions, ...args: string[]): I7zHandler;

export declare function sevenZipCli(...args: string[]): I7zHandler;

export declare function spawnSfx(sfxFile: string, targetDir: string, extra?: ExtraSpawnOptions): IToRun;

export declare function StatusCodeError(status: number, signal: string, _cwd: string, cmd: string[]): ProgramError | null;

export { }
