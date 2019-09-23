
/** @deprecated */
export declare function canceled(): Error;

export declare class CanceledError extends Error {
    constructor();
}

export declare class DisposedError extends Error {
    constructor(object: any, previous: Error);
}

export declare function isCanceledError(error: any): boolean;

export declare function isDisposedError(error: any): boolean;

export declare function isTimeoutError(error: Error): error is TimeoutError;

export declare function prettyFormatError(e: Error): string;

export declare function prettyPrintError(type: string, e: Error): void;

export declare function setErrorLogRoot(_root: string): void;

export declare class TimeoutError extends Error {
    constructor(time: number, what?: string);
}

export { }
