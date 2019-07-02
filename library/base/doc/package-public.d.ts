
export declare function arrayUpdate<T>(before: T[], after: T[]): {
    add: T[];
    del: T[];
    same: T[];
};

export declare function assertFunctionHasName(func: MaybeNamedFunction): void;

export declare class AsyncDisposable extends DisposableBase implements IAsyncDisposable {
    private readonly _disposables;
    _register<T extends IAsyncDisposable>(d: T): T;
    dispose(): Promise<void>;
}

export declare function awaitIterator<T>(generator: Iterator<T>): Promise<T>;

export declare const bindThis: MethodDecorator;

export declare class CallbackList<Argument> {
    protected list: MyCallback<Argument>[];
    add(item: MyCallback<Argument>, name?: string): number;
    remove(item: MyCallback<Argument>): MyCallback<Argument>[] | undefined;
    run(argument: Argument): boolean;
}

export declare function camelCase(str: string): string;

/** @deprecated */
export declare function canceled(): Error;

export declare class CanceledError extends Error {
    constructor();
}

export declare class CustomSet<Type = string> {
    protected registry: Type[];
    private finder;
    constructor(finder?: Finder<Type>);
    setFinder(finder: Finder<Type>): void;
    has(item: Type): boolean;
    add(item: Type): boolean;
    addAll(items: Type[]): Type[];
    remove(item: Type): boolean;
    removeAll(items: Type[]): Type[];
    readonly length: number;
    [Symbol.iterator](): Iterator<Type>;
    toArray(): Type[];
}

export declare interface DateFunction {
    (date: Date): string;
}

export declare function dateHuman(d: Date): string;

export declare function datetimeHuman(d: Date): string;

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

export declare class DelayCallbackList<Argument> {
    private delayArgument?;
    private delayComplete;
    protected list: MyDelayCallback<Argument>[];
    add(item: MyDelayCallback<Argument>, name?: string): void;
    run(argument: Argument): void;
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

export declare class DisposedError extends Error {
    constructor(object: any, previous: Error);
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

export declare function escapeRegExp(str: string): string;

export declare interface EventHandler<T> {
    (data: T): void;
}

export declare interface EventRegister<T> {
    (callback: EventHandler<T>): IDisposable;
}

declare type Finder<Type> = (this: Type[], item: Type) => number;

export declare function functionName(func: Function): any;

export declare function getErrorFrame(e: Error, frame: number): string;

export declare function globalDispose(relatedWith: Disposable | AsyncDisposable): ClassDecorator;

export declare function hookClass<TC extends IConstructorOf<T>, T>(target: TC): IHooks<T, TC>;

export declare const hookClassSymbol: unique symbol;

export declare interface IArrayUpdate<T> {
    add: T[];
    del: T[];
    same: T[];
}

export declare interface IAsyncDisposable {
    dispose(): void | Promise<void>;
}

declare interface IConstructorOf<T> extends Object {
    new (...args: any[]): T;
}

export declare interface IDisposable {
    dispose(): void;
}

export declare interface IFormatters {
    s: ITimeFormatter;
    m: ITimeFormatter;
    h: ITimeFormatter;
    d: ITimeFormatter;
}

declare interface IHooks<T, TC> {
    afterConstruct?: ((obj: T) => void)[];
    beforeConstruct?: ((obj: TC) => T | void)[];
}

export declare function init<O, T extends keyof O>(init: InitFunc<O, O[T]>): PropertyDecorator;

export declare interface InitFunc<O, T> {
    (this: O): T;
}

export declare function initOnRead<O, T extends keyof O>(target: any, propertyKey: T, init: InitFunc<O, O[T]>): void;

export declare interface IProgressHolder<T, PT> {
    progress(fn: ProgressCallback<PT>): Promise<T> & IProgressHolder<T, PT>;
}

export declare function isArraySame<T>(a1: T[], a2: T[]): boolean;

export declare function isCanceledError(error: any): boolean;

export declare function isDisposedError(error: any): boolean;

export declare function isTimeoutError(error: Error): error is TimeoutError;

export declare interface ITimeFormatter {
    (s: number): string;
}

export declare function lcfirst(str: string): string;

export declare abstract class LifecycleObject extends AsyncDisposable {
    /** sub-class should shutdown program */
    protected abstract done(): void;
    dispose(): Promise<void>;
}

export declare function linux_case(str: string): string;

export declare function linux_case_hyphen(str: string): string;

export declare interface MaybeNamedFunction extends Function {
    displayName?: string;
}

export declare const memo: MethodDecorator;

export declare const memorizeValueSymbol: unique symbol;

export declare interface MyCallback<Argument> {
    displayName?: string;
    (param: Argument): void | undefined | boolean;
}

export declare interface MyDelayCallback<Argument> {
    displayName?: string;
    (param: Argument): void;
}

export declare interface NamedFunction extends Function {
    displayName: string;
}

export declare function nameFunction<T extends Function>(name: string, func: T): T & NamedFunction;

export declare function objectPath(obj: object, path: string): any;

export declare function pad2(s: number): string;

declare type ProgressCallback<T = any> = (value: T) => void;

export declare function RegexpFinder(this: RegExp[], item: RegExp): number;

export declare function registerLocaleDateString(timeFn: DateFunction, dateFn: DateFunction): void;

export declare function registerLocaleTimeString(formatter: Partial<IFormatters>): void;

export declare function singleton(type?: SingletonType): ClassDecorator;

export declare const singletonSymbol: unique symbol;

declare enum SingletonType {
    Throw = 0,
    Return = 1
}

export declare function sizeHuman(size: number): string;

export declare function sleep(ms: number): Promise<void>;

export declare function timeHuman(d: Date): string;

export declare function timeout(ms: number, error?: string): Promise<never>;

export declare class TimeoutError extends Error {
    constructor(time: number, what?: string);
}

export declare function timeString(ms: number): string;

export declare function timeStringTiny(ms: number): string;

export declare function toDisposable(fn: () => void): IDisposable;

export declare function tryInspect(object: any): any;

export declare function ucfirst(str: string): string;

export { }
