/// <reference types="node" />
import { EventEmitter } from 'events';
import { IDisposable } from '@idlebox/common';
import { PathArray } from '@idlebox/common';
import { Readable } from 'stream';
import { Transform } from 'stream';
import { Writable } from 'stream';

export declare class BlackHoleStream extends Writable {
    _write(_chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void;
}

export declare function cleanupEnvironment(name: string, env?: NodeJS.ProcessEnv): void;

export declare class CollectingStream extends Writable {
    private buffer?;
    private _promise?;
    constructor(sourceStream?: NodeJS.ReadableStream);
    _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    getOutput(): string;
    promise(): Promise<string>;
}

export declare function commandInPath(cmd: string, alterExt?: string[]): Promise<string | undefined>;

export declare function commmandInPathSync(cmd: string, alterExt?: string[]): string | undefined;

export declare function deleteEnvironment(name: string, env?: NodeJS.ProcessEnv): void;

export declare function disposableStream<T extends Writable | Readable>(stream: T): T & IDisposable;

export declare function drainStream(stream: NodeJS.ReadableStream, size: number, start?: number, extra?: number): Promise<Buffer>;

export declare function dumpEventEmitterEmit(ev: EventEmitter): void;

export declare enum ERRNO_LINUX {
    EPERM = 1,
    ENOENT = 2,
    ESRCH = 3,
    EINTR = 4,
    EIO = 5,
    ENXIO = 6,
    E2BIG = 7,
    ENOEXEC = 8,
    EBADF = 9,
    ECHILD = 10,
    EAGAIN = 11,
    ENOMEM = 12,
    EACCES = 13,
    EFAULT = 14,
    ENOTBLK = 15,
    EBUSY = 16,
    EEXIST = 17,
    EXDEV = 18,
    ENODEV = 19,
    ENOTDIR = 20,
    EISDIR = 21,
    EINVAL = 22,
    ENFILE = 23,
    EMFILE = 24,
    ENOTTY = 25,
    ETXTBSY = 26,
    EFBIG = 27,
    ENOSPC = 28,
    ESPIPE = 29,
    EROFS = 30,
    EMLINK = 31,
    EPIPE = 32,
    EDOM = 33,
    ERANGE = 34,
    ENOMSG = 35,
    EIDRM = 36,
    ECHRNG = 37,
    EL2NSYNC = 38,
    EL3HLT = 39,
    EL3RST = 40,
    ELNRNG = 41,
    EUNATCH = 42,
    ENOCSI = 43,
    EL2HLT = 44,
    EDEADLK = 45,
    ENOLCK = 46,
    EBADE = 50,
    EBADR = 51,
    EXFULL = 52,
    ENOANO = 53,
    EBADRQC = 54,
    EBADSLT = 55,
    EDEADLOCK = 56,
    EBFONT = 57,
    ENOSTR = 60,
    ENODATA = 61,
    ETIME = 62,
    ENOSR = 63,
    ENONET = 64,
    ENOPKG = 65,
    EREMOTE = 66,
    ENOLINK = 67,
    EADV = 68,
    ESRMNT = 69,
    ECOMM = 70,
    EPROTO = 71,
    EMULTIHOP = 74,
    ELBIN = 75,
    EDOTDOT = 76,
    EBADMSG = 77,
    EFTYPE = 79,
    ENOTUNIQ = 80,
    EBADFD = 81,
    EREMCHG = 82,
    ELIBACC = 83,
    ELIBBAD = 84,
    ELIBSCN = 85,
    ELIBMAX = 86,
    ELIBEXEC = 87,
    ENOSYS = 88,
    ENMFILE = 89,
    ENOTEMPTY = 90,
    ENAMETOOLONG = 91,
    ELOOP = 92,
    EOPNOTSUPP = 95,
    EPFNOSUPPORT = 96,
    ECONNRESET = 104,
    ENOBUFS = 105,
    EAFNOSUPPORT = 106,
    EPROTOTYPE = 107,
    ENOTSOCK = 108,
    ENOPROTOOPT = 109,
    ESHUTDOWN = 110,
    ECONNREFUSED = 111,
    EADDRINUSE = 112,
    ECONNABORTED = 113,
    ENETUNREACH = 114,
    ENETDOWN = 115,
    ETIMEDOUT = 116,
    EHOSTDOWN = 117,
    EHOSTUNREACH = 118,
    EINPROGRESS = 119,
    EALREADY = 120,
    EDESTADDRREQ = 121,
    EMSGSIZE = 122,
    EPROTONOSUPPORT = 123,
    ESOCKTNOSUPPORT = 124,
    EADDRNOTAVAIL = 125,
    ENETRESET = 126,
    EISCONN = 127,
    ENOTCONN = 128,
    ETOOMANYREFS = 129,
    EPROCLIM = 130,
    EUSERS = 131,
    EDQUOT = 132,
    ESTALE = 133,
    ENOTSUP = 134,
    ENOMEDIUM = 135,
    ENOSHARE = 136,
    ECASECLASH = 137,
    EILSEQ = 138,
    EOVERFLOW = 139
}

export declare function exists(path: string): Promise<boolean>;

export declare function existsSync(path: string): boolean;

export declare function findUpUntil(from: string, file: string): Promise<string | null>;

export declare function findUpUntilSync(from: string, file: string): string | null;

export declare function getAllPathUpToRoot(from: string, append?: string): string[];

export declare function getEnvironment(name: string, env?: NodeJS.ProcessEnv): IEnvironmentResult;

export declare class HexDumpLoggerStream extends Transform {
    private readonly logFn;
    private readonly prefix;
    constructor(logFn: LogFunction, prefix?: string);
    _transform(chunk: Buffer, encoding: BufferEncoding, callback: Function): void;
}

export declare interface IEnvironmentResult {
    value: string | undefined;
    name: string;
}

export declare interface JoinPathFunction {
    (from: string, to: string): string;
}

export declare type LogFunction = (message: string, ...args: any[]) => void;

export declare class LoggerStream extends Transform {
    private readonly logFn;
    private readonly prefix;
    constructor(logFn: LogFunction, prefix?: string);
    _transform(chunk: Buffer, encoding: BufferEncoding, callback: Function): void;
}

export declare function lrelative(from: string, to: string): string;

export declare function md5(data: Buffer): string;

export declare function nodeResolvePathArray(from: string, file?: string): string[];

export declare const normalizePath: NormalizePathFunction;

export declare interface NormalizePathFunction {
    (path: string): string;
}

export declare function osTempDir(name?: string): string;

export declare const PATH_SEPARATOR: string;

export declare class PathEnvironment extends PathArray {
    private readonly name;
    private readonly env;
    constructor(varName?: string, env?: NodeJS.ProcessEnv);
    add(p: string): this;
    clear(): void;
    delete(p: string): boolean;
    save(): void;
}

export declare function prettyFormatError(e: Error): string;

export declare function prettyPrintError(type: string, e: Error): void;

export declare class RawCollectingStream extends Writable {
    private buffer?;
    private _promise?;
    constructor(sourceStream?: NodeJS.ReadableStream);
    _write(chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void;
    getOutput(): Buffer;
    promise(): Promise<Buffer>;
}

export declare const relativePath: JoinPathFunction;

export declare const resolvePath: ResolvePathFunction;

export declare interface ResolvePathFunction {
    (...pathSegments: string[]): string;
}

export declare function setErrorLogRoot(_root: string): void;

export declare function sha256(data: Buffer): string;

export declare function streamHasEnd(S: NodeJS.ReadableStream | NodeJS.WritableStream): any;

export declare function streamPromise(stream: NodeJS.ReadableStream | NodeJS.WritableStream): Promise<void>;

export declare function streamToBuffer(stream: NodeJS.ReadableStream, raw: false): Promise<string>;

export declare function streamToBuffer(stream: NodeJS.ReadableStream, raw: true): Promise<Buffer>;

export declare function writeFileIfChange(file: string, data: string | Buffer): Promise<boolean>;

export declare function writeFileIfChangeSync(file: string, data: string | Buffer): boolean;

export { }
