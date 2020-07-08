
export declare function arrayDiff<T>(before: T[], after: T[]): {
    add: T[];
    del: T[];
    same: T[];
};

export declare function arrayUnique<T>(arr: T[]): T[];

export declare function arrayUniqueReference(arr: any[]): void;

export declare function assertFunctionHasName(func: MaybeNamedFunction): void;

export declare function assertNotNull<T>(val: T): NonNullable<T>;

export declare class AsyncDisposable implements IAsyncDisposable, IDisposableBaseInternal {
    private readonly _disposables;
    protected readonly _onDisposeError: Emitter<Error>;
    readonly onDisposeError: EventRegister<Error>;
    protected readonly _onBeforeDispose: Emitter<void>;
    readonly onBeforeDispose: EventRegister<void>;
    private _disposed?;
    get hasDisposed(): boolean;
    protected assertNotDisposed(): void;
    protected _publicDispose(): boolean;
    _register<T extends IAsyncDisposable>(d: T): T;
    dispose(): Promise<void>;
}

export declare function awaitIterator<T>(generator: Iterator<T>): Promise<T>;

export declare const bindThis: MethodDecorator;

export declare class CallbackList<Argument> {
    protected list: MyCallback<Argument>[];
    add(item: MyCallback<Argument>, name?: string): number;
    remove(item: MyCallback<Argument>): MyCallback<Argument>[];
    run(argument: Argument): boolean;
}

export declare function camelCase(str: string): string;

export declare class CanceledError extends Error {
    constructor();
}

export declare function createSymbol(category: string, name: string): symbol;

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
    get length(): number;
    [Symbol.iterator](): Iterator<Type>;
    toArray(): Type[];
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
    get completed(): boolean;
    get resolved(): boolean;
    get rejected(): boolean;
    complete(value: T): void;
    error(err: any): void;
    cancel(): void;
    static wrap(prev: Promise<any>): DeferredPromise<unknown, any>;
}

export declare class DelayCallbackList<Argument> {
    private delayArgument?;
    private delayComplete;
    protected list: MyDelayCallback<Argument>[];
    add(item: MyDelayCallback<Argument>, name?: string): void;
    run(argument: Argument): void;
}

export declare class Disposable implements IDisposable, IDisposableBaseInternal {
    private readonly _disposables;
    protected readonly _onDisposeError: Emitter<Error>;
    readonly onDisposeError: EventRegister<Error>;
    protected readonly _onBeforeDispose: Emitter<void>;
    readonly onBeforeDispose: EventRegister<void>;
    private _disposed?;
    get hasDisposed(): boolean;
    protected assertNotDisposed(): void;
    protected _publicDispose(): boolean;
    _register<T extends IDisposable>(d: T): T;
    dispose(): void;
}

export declare class DisposedError extends Error {
    constructor(object: any, previous: Error);
}

export declare function disposeGlobal(): Promise<void>;

export declare class Emitter<T> implements IDisposable {
    private readonly _callbacks;
    constructor();
    fire(data: T): void;
    fireNoError(data: T): void;
    get register(): EventRegister<T>;
    handle(callback: EventHandler<T>): IDisposable;
    dispose(): void;
}

export declare function ensureDisposeGlobal(): Promise<void>;

export declare function escapeRegExp(str: string): string;

export declare interface EventHandler<T> {
    (data: T): void;
}

export declare interface EventRegister<T> {
    (callback: EventHandler<T>): IDisposable;
}

export declare class ExtendMap<K, V> extends Map<K, V> {
    getReq(id: K): V;
    getDef(id: K, def: V): V;
    entry(id: K, init: (id: K) => V): V;
}

export declare type Finder<Type> = (this: Type[], item: Type) => number;

export declare function finishAllPromise<T>(ps: Promise<T>[]): Promise<PromiseResultArray<T>>;

export declare function fromTimeStamp(timestamp: number): Date;

export declare function functionName(func: Function): string;

export declare function getErrorFrame(e: Error, frame: number): string;

export declare function getTimeStamp(date: Date): number;

export declare const globalObject: any;

export declare function globalSingleton<T>(symbol: symbol | string, constructor: () => T): T;

export declare function globalSingleton<T>(symbol: symbol | string): T | undefined;

export declare function globalSingletonDelete(symbol: symbol | string): void;

export declare function globalSingletonStrong<T>(symbol: symbol, constructor: () => T): T;

export declare function globalSingletonStrong<T>(symbol: symbol): T | undefined;

export declare function hookClass<TC extends IConstructorOf<T>, T>(target: TC): IHooks<T, TC>;

export declare const hookClassSymbol: unique symbol;

export declare namespace humanDate {
    export function time(date: Date | string | number): string;
    export function date(date: Date | string | number, sp?: string): string;
    export function datetime(date: Date | string | number): string;
    export interface ITimeFormatter {
        (s: number): string;
    }
    export interface IFormatters {
        s: ITimeFormatter;
        m: ITimeFormatter;
        h: ITimeFormatter;
        d: ITimeFormatter;
    }
    export function setLocaleFormatter(formatter: Partial<IFormatters>): void;
    export function deltaTiny(ms: number): string;
    export function delta(ms: number): string;
}

export declare function humanSize(bytes: number, fixed?: number): string;

export declare function humanSpeed(bps: number): string;

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

export declare interface IDisposableBaseInternal {
    onDisposeError: EventRegister<Error>;
    onBeforeDispose: EventRegister<void>;
    readonly hasDisposed: boolean;
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

export declare function isAbsolute(path: string): boolean;

export declare function isArraySame<T>(a1: T[], a2: T[]): boolean;

export declare function isCanceledError(error: any): boolean;

export declare function isDateInvalid(date: Date): boolean;

export declare function isDisposedError(error: any): boolean;

export declare const isElectron: boolean;

export declare const isElectronMain: boolean;

export declare const isElectronRenderer: boolean;

export declare const isLinux: boolean;

export declare const isMacintosh: boolean;

export declare const isNative: boolean;

export declare function isObjectSame(a: any, b: any): boolean;

export declare function isObjectSameRecursive(a: any, b: any): boolean;

export declare function isTimeoutError(error: Error): error is TimeoutError;

export declare const isWeb: boolean;

export declare const isWindows: boolean;

export declare interface IUniqueIdFactory<T> {
    (item: T): string;
}

export declare function lcfirst(str: string): string;

export declare abstract class LifecycleObject extends AsyncDisposable {
    /** sub-class should shutdown program */
    protected abstract done(): void;
    dispose(): Promise<void>;
}

export declare function linux_case(str: string): string;

export declare function linux_case_hyphen(str: string): string;

export declare interface MapLike<V> {
    [id: string]: V;
}

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

export declare type MyFinder<Type> = (item: Type) => number;

export declare interface NamedFunction extends Function {
    displayName: string;
}

export declare function nameFunction<T extends Function>(name: string, func: T): T & NamedFunction;

export declare function nextDay(d: Date, n?: number): Date;

export declare function nextHour(d: Date, n?: number): Date;

export declare function nextMinute(d: Date, n?: number): Date;

export declare function nextMonth(d: Date, n?: number): Date;

export declare function nextSecond(d: Date, n?: number): Date;

export declare function nextWeek(d: Date, n?: number): Date;

export declare function nextYear(d: Date, n?: number): Date;

export declare function normalizeArray<T>(input: any): T[];

export declare function normalizePath(p: string): string;

export declare function objectPath(obj: object, path: string): any;

export declare const oneDay = 86400000;

export declare const oneHour = 1440000;

export declare const oneMinute = 60000;

export declare const oneSecond = 1000;

export declare const oneWeek = 604800000;

export declare function pad2(s: number): string;

export declare class PathArray extends Set<string> {
    private readonly sep;
    constructor(init: string, sep: ':' | ';');
    add(path: string): this;
    delete(path: string): boolean;
    has(path: string): boolean;
    toString(): string;
    join(part: string): string[];
}

export declare type ProgressCallback<T = any> = (value: T) => void;

export declare function promiseBool(p: Promise<any>): Promise<boolean>;

export declare interface PromiseResultArray<T> {
    count: number;
    fulfilledResult: T[];
    fulfilled: number[];
    rejectedResult: Error[];
    rejected: number[];
}

export declare function RegexpFinder(this: RegExp[], item: RegExp): number;

export declare function registerGlobalLifecycle(object: IDisposable): void;

export declare function singleton(type?: SingletonType): ClassDecorator;

export declare const singletonSymbol: unique symbol;

export declare enum SingletonType {
    Throw = 0,
    Return = 1
}

export declare function sleep(ms: number): Promise<void>;

export declare function throwNull<T>(val: T): NonNullable<T>;

export declare function timeout(ms: number, error?: string): Promise<never>;

export declare class TimeoutError extends Error {
    constructor(time: number, what?: string);
}

export declare function timeoutPromise<T>(ms: number, p: Promise<T>): Promise<T>;

export declare function timeoutPromise<T>(ms: number, message: string, p: Promise<T>): Promise<T>;

export declare function timeoutPromise<T, PT = any>(ms: number, p: DeferredPromise<T, PT>): DeferredPromise<T, PT>;

export declare function timeoutPromise<T, PT = any>(ms: number, message: string, p: DeferredPromise<T, PT>): DeferredPromise<T, PT>;

export declare function toDisposable(fn: () => void): IDisposable;

export declare function tryInspect(object: any): any;

export declare function ucfirst(str: string): string;

export declare function uniqueFilter<T>(idFactory?: IUniqueIdFactory<T>): (item: T) => boolean;

export declare const userAgent: string;

export declare type ValueCallback<T = any> = (value: T | Promise<T>) => void;

export { }
