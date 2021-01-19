
export declare function addDisposableEventListener<T extends Function>(target: IEventHostObject<T>, type: string, handler: T): IDisposable;

/**
 * Compare two array, returns the difference from `before` to `after`
 * @public
 */
export declare function arrayDiff<T>(before: T[], after: T[]): {
    add: T[];
    del: T[];
    same: T[];
};

/**
 * Returns a new array without duplicate values
 * @public
 */
export declare function arrayUnique<T>(arr: T[]): T[];

/**
 * Removes duplicate values from an array
 * @public
 */
export declare function arrayUniqueReference(arr: any[]): void;

/**
 * Assert function must have oneof displayName/name property
 */
export declare function assertFunctionHasName(func: MaybeNamedFunction): void;

/**
 * assert value is not null or undefined or NaN
 * @public
 */
export declare function assertNotNull<T>(val: T | null | undefined): T;

/**
 * Async version of Disposable
 * @public
 */
export declare class AsyncDisposable implements IAsyncDisposable, IDisposableBaseInternal {
    private readonly _disposables;
    protected readonly _onDisposeError: Emitter<Error>;
    readonly onDisposeError: EventRegister<Error>;
    protected readonly _onBeforeDispose: Emitter<void>;
    readonly onBeforeDispose: EventRegister<void>;
    private _disposed?;
    get hasDisposed(): boolean;
    /**
     * @throws if already disposed
     */
    assertNotDisposed(): void;
    /**
     * register a disposable object
     */
    _register<T extends IAsyncDisposable>(d: T): T;
    dispose(): Promise<void>;
}

/**
 * Convert Iterator into Promise, resolve with the last value from Iterator
 */
export declare function awaitIterator<T>(generator: Iterator<T>): Promise<T>;

/**
 * Auto bind `this` to class method
 */
export declare const bindThis: MethodDecorator;

/**
 * Manage a list of callback
 */
export declare class CallbackList<Argument extends [
]> {
    protected list: MyCallback<Argument>[];
    protected running: boolean;
    constructor();
    reset(): void;
    /**
     * @param name optional name of `item` (will assign displayName to `item`)
     * @returns function list length
     */
    add(item: MyCallback<Argument>, name?: string): number;
    /**
     * @returns if removed: return `item`; if did not exists: return null
     */
    remove(item: MyCallback<Argument>): typeof item | null;
    /**
     * Stop run if one callback return `true`
     * @returns {boolean} true if one callback return true
     */
    run(...argument: Argument): boolean;
}

/** @public */
export declare function camelCase(str: string): string;

/**
 * Error when cancel() is called
 * @public
 */
export declare class CanceledError extends Error {
    constructor();
}

/** @public */
export declare interface CancellationToken {
    readonly isCancellationRequested: boolean;
    onCancellationRequested(callback: EventHandler<void>): IDisposable;
}

/** @public */
export declare class CancellationTokenSource extends DisposableOnce implements IDisposable {
    private readonly driver;
    readonly token: CancellationToken;
    constructor();
    cancel(): void;
    _dispose(): void;
}

/**
 * Get a symbol from window/global object, if not exists, create it
 *
 * this is very like Symbol.for, but not real global symbol
 * @public
 */
export declare function createSymbol(category: string, name: string): symbol;

/**
 * Like a Set, but use custom compare function insteadof ===
 */
export declare class CustomSet<Type = string> {
    protected registry: Type[];
    private finder;
    constructor(finder?: Finder<Type>);
    setFinder(finder: Finder<Type>): void;
    has(item: Type): boolean;
    add(item: Type): boolean;
    /**
     * @returns all added values
     */
    addAll(items: Type[]): Type[];
    delete(item: Type): boolean;
    /**
     * @returns all deleted values
     */
    deleteAll(items: Type[]): Type[];
    clear(): void;
    get length(): number;
    get size(): number;
    [Symbol.iterator](): Iterator<Type>;
    keys(): Iterator<Type>;
    values(): Iterator<Type>;
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
    private _progressList?;
    constructor();
    notify(progress: PT): this;
    progress(fn: ProgressCallback<PT>): void;
    get completed(): boolean;
    get resolved(): boolean;
    get rejected(): boolean;
    /**
     * resolve the promise
     */
    complete(value: T): void;
    /**
     * reject the promise
     */
    error(err: any): void;
    /**
     * reject the promise with CancelError
     */
    cancel(): void;
    /**
     * Convert promise into deferred
     * returns a DeferredPromise, resolve when prev resolve, reject when prev reject
     */
    static wrap(prev: Promise<any>): DeferredPromise<unknown, any>;
}

/**
 * remember arguments after run
 * run all later added function with memorized argument
 */
export declare class DelayCallbackList<Argument extends [
]> {
    private delayArgument?;
    private delayComplete;
    protected list?: MyDelayCallback<Argument>[];
    add(item: MyDelayCallback<Argument>, name?: string): void;
    run(argument: Argument): void;
}

/**
 * Standalone disposable class, can use as instance or base class.
 */
export declare class Disposable implements IDisposable, IDisposableBaseInternal {
    private readonly _disposables;
    protected readonly _onDisposeError: Emitter<Error>;
    readonly onDisposeError: EventRegister<Error>;
    protected readonly _onBeforeDispose: Emitter<void>;
    readonly onBeforeDispose: EventRegister<void>;
    private _disposed?;
    get hasDisposed(): boolean;
    /**
     * @throws if already disposed
     */
    assertNotDisposed(): void;
    _register<T extends IDisposable>(d: T): T;
    dispose(): void;
}

export declare abstract class DisposableOnce implements IDisposable {
    private _disposed?;
    get hasDisposed(): boolean;
    dispose(): void;
    protected abstract _dispose(): void;
}

/**
 * Error when call dispose() twice
 */
export declare class DisposedError extends Error {
    constructor(object: any, previous: Error);
}

/**
 * Dispose the global disposable store
 * this function must be manually called by user, when registerGlobalLifecycle is used
 *
 * @throws when call twice
 */
export declare function disposeGlobal(): Promise<void>;

export declare class Emitter<T> implements IDisposable {
    private readonly _callbacks;
    constructor();
    fire(data: T): void;
    /**
     * Same with `fire`, but do not stop run when catch error
     */
    fireNoError(data: T): void;
    get register(): EventRegister<T>;
    handle(callback: EventHandler<T>): IDisposable;
    dispose(): void;
}

/**
 * Same as disposeGlobal, but do not throw by duplicate call
 */
export declare function ensureDisposeGlobal(): Promise<void>;

/** @public */
export declare function escapeRegExp(str: string): string;

export declare interface EventHandler<T> {
    (data: T): void;
}

export declare interface EventRegister<T> {
    (callback: EventHandler<T>): IDisposable;
}

/**
 * A map, will throw error when try to get not exists key
 */
export declare class ExtendMap<K, V> extends Map<K, V> {
    /**
     * Get value from map, if not exists, throw an error
     */
    get(id: K): V;
    /**
     * Get value from map, if not exists, return def instead (not insert it into map)
     */
    get(id: K, def: V): V;
    /**
     * Get a value, if not exists, call init() and set to map
     */
    entry(id: K, init: (id: K) => V): V;
}

/** Find the index of given item */
export declare interface Finder<Type> {
    (this: Type[], item: Type): number;
}

/**
 * @deprecated Use Promise.allSettled instead
 */
export declare function finishAllPromise<T>(ps: Promise<T>[]): Promise<PromiseResultArray<T>>;

/**
 * Takes ms
 */
export declare function fromTimeStamp(timestamp: number): Date;

/**
 * Get displayName/name of a function
 */
export declare function functionName(func: Function): string;

/**
 * Get nth line of Error.stack
 * @returns {string} if frame greater than max, return ''
 */
export declare function getErrorFrame(e: Error, frame: number): string;

/**
 * Returns ms
 */
export declare function getTimeStamp(date: Date): number;

/**
 * window in browser, global in nodejs
 * @public
 */
export declare const globalObject: any;

/**
 * Same with globalSingletonStrong, but save instance in a WeakMap, so it maybe delete by gc if no reference
 * @public
 */
export declare function globalSingleton<T>(symbol: symbol | string, constructor: () => T): T;

/**
 * Same with globalSingletonStrong, but save instance in a WeakMap, so it maybe delete by gc if no reference
 * @public
 */
export declare function globalSingleton<T>(symbol: symbol | string): T | undefined;

/**
 * Delete a key from window/global space
 * use with care
 * @public
 */
export declare function globalSingletonDelete(symbol: symbol | string): void;

/**
 * Get an singleton instance from window/global space
 * if symbol did not exists, create it and assign to window/global
 * @public
 */
export declare function globalSingletonStrong<T>(symbol: symbol, constructor: () => T): T;

/**
 * Get an singleton instance from window/global space
 * @public
 */
export declare function globalSingletonStrong<T>(symbol: symbol): T | undefined;

export declare function hookClass<TC extends IConstructorOf<T>, T>(target: TC): IHooks<T, TC>;

export declare const hookClassSymbol: unique symbol;

export declare namespace humanDate {
    /**
     * Format: HH:mm:ss
     */
    export function time(date: Date | string | number): string;
    /**
     * Format: YYYY-MM-dd
     *
     * separator can change
     */
    export function date(date: Date | string | number, sp?: string): string;
    /**
     * Format: YYYY-MM-dd HH:mm:ss
     */
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
    /**
     * set format for time delta
     */
    export function setLocaleFormatter(formatter: Partial<IFormatters>): void;
    /**
     * format time delta (in ms) to string, like: '1d'
     * when ms<=0, returns '0s'
     *
     * format can set by `setLocaleFormatter`
     * day is the largest unit
     */
    export function deltaTiny(ms: number): string;
    /**
     * format time delta (in ms) to string, like: '1d10m42s'
     * when ms<=0, returns '0s'
     *
     * format can set by `setLocaleFormatter`
     * day is the largest unit
     */
    export function delta(ms: number): string;
}

/**
 * Convert bytes to largest unit, with binary prefix unit (1024), eg: 211.293GiB
 * @public
 */
export declare function humanSize(bytes: number, fixed?: number): string;

/**
 * Convert bytes to largest unit, with SI prefix unit (1000), eg: 211.293GB
 * @public
 */
export declare function humanSizeSI(bytes: number, fixed?: number): string;

/** @deprecated */
export declare function humanSpeed(bps: number): string;

/**
 * @public
 */
export declare interface IArrayUpdate<T> {
    add: T[];
    del: T[];
    same: T[];
}

/** @public */
export declare interface IAsyncDisposable {
    dispose(): void | Promise<void>;
}

declare interface IConstructorOf<T> extends Object {
    new (...args: any[]): T;
}

/** @public */
export declare interface IDisposable {
    dispose(): void;
}

/**
 * @private
 */
export declare interface IDisposableBaseInternal {
    onDisposeError: EventRegister<Error>;
    onBeforeDispose: EventRegister<void>;
    readonly hasDisposed: boolean;
}

export declare interface IEventHostObject<T extends Function> {
    addEventListener(type: string, handler: T): any;
    removeEventListener(type: string, handler: T): any;
}

declare interface IHooks<T, TC> {
    afterConstruct?: ((obj: T) => void)[];
    beforeConstruct?: ((obj: TC) => T | void)[];
}

/**
 * Decorater version of `initOnRead`
 * @see initOnRead
 */
export declare function init<O, T extends keyof O>(init: InitFunc<O, O[T]>): PropertyDecorator;

/** @public */
export declare interface InitFunc<O, T> {
    (this: O): T;
}

/**
 * Define property on target, call init it when first use, them memorize
 * @public
 */
export declare function initOnRead<O, T extends keyof O>(target: any, propertyKey: T, init: InitFunc<O, O[T]>): void;

export declare interface IProgressHolder<T, PT> {
    progress(fn: ProgressCallback<PT>): Promise<T> & IProgressHolder<T, PT>;
}

/**
 * return true if a path is absolute:
 *   - /xxxx
 *   - \xxxx
 *   - c:/
 *   - c:\
 *   - http://
 */
export declare function isAbsolute(path: string): boolean;

/**
 * is the two array EXACTLY same
 * @public
 */
export declare function isArraySame<T>(a1: T[], a2: T[]): boolean;

/** @public */
export declare function isCanceledError(error: any): boolean;

/**
 * Check if a date is NaN
 */
export declare function isDateInvalid(date: Date): boolean;

export declare function isDisposedError(error: any): boolean;

export declare const isElectron: boolean;

export declare const isElectronMain: boolean;

export declare const isElectronRenderer: boolean;

export declare const isLinux: boolean;

export declare const isMacintosh: boolean;

export declare const isNative: boolean;

/**
 * Should ensure a and b is none-null before call this
 * @returns true when a and b has EXACTLY same keys and values
 */
export declare function isObjectSame(a: any, b: any): boolean;

/**
 * Should ensure a and b is none-null before call this
 * @returns true when a and b has EXACTLY same keys and values, recursive compare all object values
 */
export declare function isObjectSameRecursive(a: any, b: any): boolean;

/** @public */
export declare function isTimeoutError(error: Error): error is TimeoutError;

export declare const isWeb: boolean;

export declare const isWindows: boolean;

export declare interface IUniqueIdFactory<T> {
    (item: T): string;
}

/**
 * Lowercase first char
 * @public
 */
export declare function lcfirst(str: string): string;

/* Excluded from this release type: LifecycleObject */

/** @public */
export declare function linux_case(str: string): string;

/** @public */
export declare function linux_case_hyphen(str: string): string;

export declare interface MapLike<V> {
    [id: string]: V;
}

export declare interface MaybeNamedFunction extends Function {
    displayName?: string;
}

/**
 * Decorate class method/getter
 *
 * remember first return value of method/getter, directlly return memorized value when call it again
 */
export declare const memo: MethodDecorator;

export declare const memorizeValueSymbol: unique symbol;

export declare interface MyCallback<Argument extends [
]> {
    displayName?: string;
    (...param: Argument): void | undefined | boolean;
}

export declare interface MyDelayCallback<Argument extends [
]> {
    displayName?: string;
    (...param: Argument): void;
}

/**
 * Function with displayName
 */
export declare interface NamedFunction extends Function {
    displayName: string;
}

/**
 * Set displayName of a function
 */
export declare function nameFunction<T extends Function>(name: string, func: T): T & NamedFunction;

export declare function nextDay(d: Date, n?: number): Date;

export declare function nextHour(d: Date, n?: number): Date;

export declare function nextMinute(d: Date, n?: number): Date;

export declare function nextMonth(d: Date, n?: number): Date;

export declare function nextSecond(d: Date, n?: number): Date;

export declare function nextWeek(d: Date, n?: number): Date;

export declare function nextYear(d: Date, n?: number): Date;

/**
 * ensure a value is an array
 * @public
 */
export declare function normalizeArray<T>(input: T | T[]): T[];

/**
 * replace // to /
 * replace \ to /
 * remove ending /
 */
export declare function normalizePath(p: string): string;

/**
 * Get deep child property of an object
 * @param path object path seprate by "."
 */
export declare function objectPath(obj: object, path: string): any;

export declare const oneDay = 86400000;

export declare const oneHour = 1440000;

export declare const oneMinute = 60000;

export declare const oneSecond = 1000;

export declare const oneWeek = 604800000;

/**
 * Pad number to two digits string, used in time format
 * @public
 */
export declare function pad2(s: number): string;

/**
 * Work on "PATH"-like values
 */
export declare class PathArray extends Set<string> {
    private readonly sep;
    constructor(init: string, sep: ':' | ';');
    add(paths: string): this;
    delete(paths: string): boolean;
    has(path: string): boolean;
    toString(): string;
    /**
     * @returns an array with `part` append to every element
     */
    join(part: string): string[];
}

export declare type ProgressCallback<T = any> = (value: T) => void;

/**
 * resolve with true when `p` resolve
 * resolve with false when `p` reject (and drop error)
 */
export declare function promiseBool(p: Promise<any>): Promise<boolean>;

/** @deprecated */
export declare interface PromiseResultArray<T> {
    count: number;
    fulfilledResult: T[];
    fulfilled: number[];
    rejectedResult: Error[];
    rejected: number[];
}

export declare function RegexpFinder(this: RegExp[], item: RegExp): number;

/**
 * Add object into global disposable store, it will be dispose when call to `disposeGlobal`
 */
export declare function registerGlobalLifecycle(object: IDisposable): void;

export declare function singleton(type?: SingletonType): ClassDecorator;

export declare const singletonSymbol: unique symbol;

export declare enum SingletonType {
    Throw = 0,
    Return = 1
}

/**
 * @returns promise resolve after specific time
 */
export declare function sleep(ms: number): Promise<void>;

/**
 * Sort string array alphabet order
 *
 * to be used in <arr>.sort()
 * @public
 */
export declare function sortByString(a: string, b: string): number;

/**
 * assert value is not null or undefined or NaN
 * @throws Value is null or undefined
 * @public
 */
export declare function throwNull<T>(val: T): NonNullable<T>;

/**
 * @returns promise reject with TimeoutError after specific time
 */
export declare function timeout(ms: number, error?: string): Promise<never>;

/**
 * Error when timeout() done
 * @public
 */
export declare class TimeoutError extends Error {
    constructor(time: number, what?: string);
}

export declare function timeoutPromise<T>(ms: number, p: Promise<T>): Promise<T>;

export declare function timeoutPromise<T>(ms: number, message: string, p: Promise<T>): Promise<T>;

export declare function timeoutPromise<T, PT = any>(ms: number, p: DeferredPromise<T, PT>): DeferredPromise<T, PT>;

export declare function timeoutPromise<T, PT = any>(ms: number, message: string, p: DeferredPromise<T, PT>): DeferredPromise<T, PT>;

/**
 * Convert "dispose function" to disposable object
 * @public
 */
export declare function toDisposable(fn: () => void): IDisposable;

/**
 * try to call `inspect` method of an object, if not exists, call `toString`.
 * @returns {string}
 */
export declare function tryInspect(object: any): any;

/**
 * Uppercase first char
 * @public
 */
export declare function ucfirst(str: string): string;

/**
 * Returns a function to be used in <arr>.filter()
 *
 * the returned function can use multiple times, it will remember all values inter multiple arrays
 *
 * @param {IUniqueIdFactory} idFactory function takes an array element, return it's id to be compare with each other
 * @public
 */
export declare function uniqueFilter<T>(idFactory?: IUniqueIdFactory<T>): (item: T) => boolean;

declare interface Unsubscribable {
    unsubscribe(): void;
}

export declare function unsubscribableToDisposable(subscription: Unsubscribable): {
    dispose: () => void;
};

export declare const userAgent: string;

export declare type ValueCallback<T = any> = (value: T | Promise<T>) => void;

export { }
