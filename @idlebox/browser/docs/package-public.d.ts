import { WrappedConsole } from '@idlebox/common';
import { WrappedConsoleOptions } from '@idlebox/common';

declare const colorMap: {
    info: string;
    success: string;
    debug: string;
    error: string;
    trace: string;
    warn: string;
    assert: string;
};

export declare class TimeoutStorage<T> {
    private readonly storage;
    private readonly valueKey;
    private readonly expireKey;
    constructor(key: string, storage?: Storage);
    save(data: Readonly<T>, expire: string | Date): void;
    forget(): void;
    getExpire(): Date | null;
    read(defaultVal: Readonly<T>): Readonly<T>;
    read(): Readonly<T> | undefined;
}

declare interface WebConsoleOptions {
    color?: boolean | Partial<typeof colorMap>;
}

export declare class WrappedWebConsole extends WrappedConsole {
    private readonly colors;
    constructor(title: string, { color, ...opt }?: WrappedConsoleOptions & WebConsoleOptions);
    protected processColorLabel(msg: any[], pos: number, level: string, prefix: string): void;
}

export { }
