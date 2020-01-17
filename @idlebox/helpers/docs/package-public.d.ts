
export declare function arrayDiff<T>(before: T[], after: T[]): {
    add: T[];
    del: T[];
    same: T[];
};

export declare function arrayUnique<T>(arr: T[]): T[];

export declare function arrayUniqueReference(arr: any[]): void;

export declare function assertFunctionHasName(func: MaybeNamedFunction): void;

export declare function assertNotNull<T>(val: T): NonNullable<T>;

export declare function awaitIterator<T>(generator: Iterator<T>): Promise<T>;

export declare interface Callable {
    (...args: any[]): any;
    readonly name?: string;
}

export declare class CallbackList<Argument> {
    protected list: MyCallback<Argument>[];
    add(item: MyCallback<Argument>, name?: string): number;
    remove(item: MyCallback<Argument>): MyCallback<Argument>[];
    run(argument: Argument): boolean;
}

export declare function camelCase(str: string): string;

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

export declare class DelayCallbackList<Argument> {
    private delayArgument?;
    private delayComplete;
    protected list: MyDelayCallback<Argument>[];
    add(item: MyDelayCallback<Argument>, name?: string): void;
    run(argument: Argument): void;
}

export declare function escapeRegExp(str: string): string;

export declare class ExtendMap<K, V> extends Map<K, V> {
    getReq(id: K): V;
    getDef(id: K, def: V): V;
    entry(id: K, init: (id: K) => V): V;
}

export declare type Finder<Type> = (this: Type[], item: Type) => number;

export declare function finishAllPromise<T>(ps: Promise<T>[]): Promise<PromiseResultArray<T>>;

export declare function functionName(func: Callable): string | undefined;

export declare function getErrorFrame(e: Error, frame: number): string;

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

export declare interface InitFunc<O, T> {
    (this: O): T;
}

export declare function initOnRead<O, T extends keyof O>(target: any, propertyKey: T, init: InitFunc<O, O[T]>): void;

export declare function isAbsolute(path: string): boolean;

export declare function isArraySame<T>(a1: T[], a2: T[]): boolean;

export declare interface IUniqueIdFactory<T> {
    (item: T): string;
}

export declare function lcfirst(str: string): string;

export declare function linux_case(str: string): string;

export declare function linux_case_hyphen(str: string): string;

export declare interface MapLike<V> {
    [id: string]: V;
}

export declare interface MaybeNamedFunction extends Callable {
    displayName?: string;
}

export declare interface MyCallback<Argument> {
    displayName?: string;
    (param: Argument): void | undefined | boolean;
}

export declare interface MyDelayCallback<Argument> {
    displayName?: string;
    (param: Argument): void;
}

export declare type MyFinder<Type> = (item: Type) => number;

export declare interface NamedFunction extends Callable {
    displayName: string;
}

export declare function nameFunction<T extends Callable>(name: string, func: T): T & NamedFunction;

export declare function normalizeArray<T>(input: any): T[];

export declare function objectPath(obj: object, path: string): any;

export declare function pad2(s: number): string;

export declare interface PromiseResultArray<T> {
    count: number;
    fulfilledResult: T[];
    fulfilled: number[];
    rejectedResult: Error[];
    rejected: number[];
}

export declare function RegexpFinder(this: RegExp[], item: RegExp): number;

export declare function throwNull<T>(val: T): NonNullable<T>;

export declare function tryInspect(object: any): any;

export declare function ucfirst(str: string): string;

export declare function uniqueFilter<T>(idFactory?: IUniqueIdFactory<T>): (item: T) => boolean;

export { }
