/// <reference types="node" />
import stream = require('node:stream');

export type Callback = (err?: Error | null) => any;

export interface Pack extends stream.Readable {
	/**
	 * To create a pack stream use tar.pack() and call pack.entry(header, [callback]) to add tar entries.
	 */
	entry(headers: Headers, callback?: Callback): stream.Writable;
	entry(headers: Headers, buffer?: string | Buffer, callback?: Callback): stream.Writable;
	finalize(): void;
}

declare module 'make-fetch-happen/make-fetch-happen/lib/cache/key.js' {
	export function cacheKey(key: string): string;
}
