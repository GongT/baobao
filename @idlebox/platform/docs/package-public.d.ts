/// <reference types="node" />

/** @deprecated moved into node-helpers */
export declare function exists(path: string): Promise<boolean>;

/** @deprecated moved into node-helpers */
export declare function existsSync(path: string): boolean;

export declare function findEnvironment(name: string, object?: ProcessEnv): {
    key: string;
    value: string | undefined;
} | undefined;

export declare function findUpUntil(from: string, file: string): Promise<string | null>;

export declare function findUpUntilSync(from: string, file: string): string | null;

export declare function getAllPathUpToRoot(from: string, append?: string): string[];

export declare const isLinux: boolean;

export declare const isMacintosh: boolean;

export declare const isNative: boolean;

export declare const isWeb: boolean;

export declare const isWindows: boolean;

export declare interface JoinPathFunction {
    (from: string, to: string): string;
}

export declare function lrelative(from: string, to: string): string;

export declare const nodeProcessEnv: PlatformPathArray;

export declare function nodeResolvePathArray(from: string, file?: string): string[];

export declare interface NormalizePathFunction {
    (path: string): string;
}

export declare const normalizePosixPath: NormalizePathFunction;

export declare function osTempDir(name?: string): string;

export declare class PlatformPathArray {
    private readonly envName;
    private readonly env;
    private current;
    constructor(envName: string, env?: ProcessEnv);
    prepend(...paths: string[]): void;
    append(...paths: string[]): void;
    save(): void;
    private reload;
    toString(): string;
    [Symbol.iterator](): IterableIterator<string>;
}

export declare interface ProcessEnv {
    [key: string]: string | undefined;
}

export declare const relativePath: JoinPathFunction;

export declare function removeEnvironment(name: string, object?: NodeJS.ProcessEnv): undefined;

export declare const resolvePath: ResolvePathFunction;

export declare interface ResolvePathFunction {
    (...pathSegments: string[]): string;
}

export declare const userAgent: string;

export { }
