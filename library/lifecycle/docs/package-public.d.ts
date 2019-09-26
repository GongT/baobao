
export declare class AsyncDisposable implements IAsyncDisposable, IDisposableBaseInternal {
    private readonly _disposables;
    protected readonly _onDisposeError: Emitter<Error>;
    readonly onDisposeError: EventRegister<Error>;
    protected readonly _onBeforeDispose: Emitter<void>;
    readonly onBeforeDispose: EventRegister<void>;
    private _disposed?;
    readonly hasDisposed: boolean;
    protected assertNotDisposed(): void;
    protected _publicDispose(): boolean;
    _register<T extends IAsyncDisposable>(d: T): T;
    dispose(): Promise<void>;
}

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

export declare class Disposable implements IDisposable, IDisposableBaseInternal {
    private readonly _disposables;
    protected readonly _onDisposeError: Emitter<Error>;
    readonly onDisposeError: EventRegister<Error>;
    protected readonly _onBeforeDispose: Emitter<void>;
    readonly onBeforeDispose: EventRegister<void>;
    private _disposed?;
    readonly hasDisposed: boolean;
    protected assertNotDisposed(): void;
    protected _publicDispose(): boolean;
    _register<T extends IDisposable>(d: T): T;
    dispose(): void;
}

export declare function disposeGlobal(): Promise<void>;

export declare class Emitter<T> implements IDisposable {
    private readonly _callbacks;
    constructor();
    fire(data: T): void;
    fireNoError(data: T): void;
    readonly register: EventRegister<T>;
    handle(callback: EventHandler<T>): IDisposable;
    dispose(): void;
}

export declare interface EventHandler<T> {
    (data: T): void;
}

export declare interface EventRegister<T> {
    (callback: EventHandler<T>): IDisposable;
}

export declare interface IAsyncDisposable {
    dispose(): void | Promise<void>;
}

export declare interface IDisposable {
    dispose(): void;
}

export declare interface IDisposableBaseInternal {
    onDisposeError: EventRegister<Error>;
    onBeforeDispose: EventRegister<void>;
    readonly hasDisposed: boolean;
}

export declare interface IProgressHolder<T, PT> {
    progress(fn: ProgressCallback<PT>): Promise<T> & IProgressHolder<T, PT>;
}

export declare abstract class LifecycleObject extends AsyncDisposable {
    /** sub-class should shutdown program */
    protected abstract done(): void;
    dispose(): Promise<void>;
}

declare type ProgressCallback<T = any> = (value: T) => void;

export declare function registerGlobalLifecycle(object: IDisposable): void;

export declare function sleep(ms: number): Promise<void>;

export declare function timeout(ms: number, error?: string): Promise<never>;

export declare function toDisposable(fn: () => void): IDisposable;

export { }
