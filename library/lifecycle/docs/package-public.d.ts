
export declare class AsyncDisposable extends DisposableBase implements IAsyncDisposable {
    private readonly _disposables;
    _register<T extends IAsyncDisposable>(d: T): T;
    dispose(): Promise<void>;
}

export declare class Disposable extends DisposableBase implements IDisposable {
    private readonly _disposables;
    _register<T extends IDisposable>(d: T): T;
    dispose(): void;
}

declare abstract class DisposableBase {
    protected readonly _onDisposeError: Emitter<Error>;
    readonly onDisposeError: EventRegister<Error>;
    protected readonly _onBeforeDispose: Emitter<void>;
    readonly onBeforeDispose: EventRegister<void>;
    private _disposed?;
    readonly hasDisposed: boolean;
    protected assertNotDisposed(): void;
    protected _publicDispose(): boolean;
}

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

export declare abstract class LifecycleObject extends AsyncDisposable {
    /** sub-class should shutdown program */
    protected abstract done(): void;
    dispose(): Promise<void>;
}

export declare function toDisposable(fn: () => void): IDisposable;

export { }
