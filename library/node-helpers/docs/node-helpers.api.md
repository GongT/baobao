## API Report File for "@idlebox/node-helpers"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { IDisposable } from '@idlebox/lifecycle';
import { Readable } from 'stream';
import { Transform } from 'stream';
import { Writable } from 'stream';

// Warning: (ae-missing-release-tag) "BlackHoleStream" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export class BlackHoleStream extends Writable {
    // (undocumented)
    _write(_chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void;
}

// Warning: (ae-missing-release-tag) "CollectingStream" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export class CollectingStream extends Writable {
    constructor(sourceStream?: NodeJS.ReadableStream);
    // (undocumented)
    getOutput(): string;
    // (undocumented)
    promise(): Promise<string>;
    // (undocumented)
    _write(chunk: Buffer, encoding: string, callback: (error?: Error | null) => void): void;
}

// Warning: (ae-missing-release-tag) "disposableStream" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export function disposableStream<T extends Writable | Readable>(stream: T): T & IDisposable;

// Warning: (ae-missing-release-tag) "HexDumpLoggerStream" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export class HexDumpLoggerStream extends Transform {
    // Warning: (ae-forgotten-export) The symbol "LogFunction" needs to be exported by the entry point _export_all_in_one_index.d.ts
    constructor(logFn: LogFunction, prefix?: string);
    // (undocumented)
    _transform(chunk: Buffer, encoding: string, callback: Function): void;
}

// Warning: (ae-missing-release-tag) "LoggerStream" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export class LoggerStream extends Transform {
    constructor(logFn: LogFunction, prefix?: string);
    // (undocumented)
    _transform(chunk: Buffer, encoding: string, callback: Function): void;
}

// Warning: (ae-missing-release-tag) "nd5" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export function nd5(data: Buffer): string;

// Warning: (ae-missing-release-tag) "RawCollectingStream" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export class RawCollectingStream extends Writable {
    constructor(sourceStream?: NodeJS.ReadableStream);
    // (undocumented)
    getOutput(): Buffer;
    // (undocumented)
    promise(): Promise<Buffer>;
    // (undocumented)
    _write(chunk: Buffer, _encoding: string, callback: (error?: Error | null) => void): void;
}

// Warning: (ae-missing-release-tag) "sha256" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export function sha256(data: Buffer): string;

// Warning: (ae-missing-release-tag) "streamHasEnd" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export function streamHasEnd(S: NodeJS.ReadableStream | NodeJS.WritableStream): any;

// Warning: (ae-missing-release-tag) "streamPromise" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
// 
// @public (undocumented)
export function streamPromise(stream: NodeJS.ReadableStream | NodeJS.WritableStream): Promise<void>;


// (No @packageDocumentation comment for this package)

```