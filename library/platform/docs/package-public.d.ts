/// <reference types="node" />

export declare function exists(path: string): Promise<boolean>;

export declare function existsSync(path: string): boolean;

export declare function findEnvironment(name: string, object?: ProcessEnv): {
    key: string;
    value: string | undefined;
} | undefined;

export declare function findUpUntil(from: string, file: string): Promise<string | null>;

export declare function findUpUntilSync(from: string, file: string): string | null;

export declare const nodeProcessEnv: PlatformPathArray;

export declare function nodeResolvePathArray(from: string, file?: string): string[];

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

export declare function removeEnvironment(name: string, object?: NodeJS.ProcessEnv): undefined;

export { }
