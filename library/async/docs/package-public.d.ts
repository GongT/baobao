
/**
 * a promise can resolve or reject later
 * @public
 */
export declare class DeferredPromise<T, PT = any> {
    readonly p: Promise<T> & IProgressHolder<T, PT>;
    private _completeCallback;
    private _errorCallback;
    private _state;
    private _progressList;
    constructor();
    notify(progress: PT): this;
    progress(fn: ProgressCallback<PT>): void;
    readonly completed: boolean;
    readonly resolved: boolean;
    readonly rejected: boolean;
    complete(value: T): void;
    error(err: any): void;
    cancel(): void;
}

export declare interface IProgressHolder<T, PT> {
    progress(fn: ProgressCallback<PT>): Promise<T> & IProgressHolder<T, PT>;
}

declare type ProgressCallback<T = any> = (value: T) => void;

export declare function sleep(ms: number): Promise<void>;

export declare function timeout(ms: number, error?: string): Promise<never>;

export { }
